// 创建threejs类 包括场景、相机、渲染器、光源、控制器等
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useResizeObserver } from "@vueuse/core";
import { OutlinePass, RoomEnvironment } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import emitter from "@/utils/emitter.ts";
import useComposer from "@/hooks/useComposer.ts";
import useModel from "@/hooks/useModel.ts";
import useTree from "@/hooks/useTree.ts";
// import useGui from "@/hooks/useGui.ts";
import useAnimation from "@/hooks/useAnimation.ts";
const { outlinePass } = useComposer();
const { setSelectedObject } = useModel();
const { setCheckedNodes } = useTree();
// const { gui, createCameraInteractor } = useGui();
const { modelRotate, modelScale, createCameraAnimation } = useAnimation();
const url = `${import.meta.env.VITE_PUBLIC_PATH}draco/`;
const dracoDecoderPath = new URL(url, import.meta.url).href;
export default class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  container: HTMLElement;
  tree?: InstanceType<typeof ElTree>;
  model?: GLTF;
  modelUrl: string;
  composer: EffectComposer | null = null;
  outlinePass: OutlinePass | null = null;
  sceneHelper: THREE.Scene;
  intersects: Array<any> = [];
  constructor(options: { container: HTMLElement; modelUrl?: any; tree?: any }) {
    this.container = options.container;
    this.modelUrl = options.modelUrl;
    this.tree = options.tree;
    const { scene, camera, renderer, controls } = initScene(this.container);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;
    this.composer = new EffectComposer(this.renderer);
    this.sceneHelper = new THREE.Scene();
    this.sceneHelper.name = "SceneHelper";
  }
  async init() {
    this.initRaycaster();
    this.addOutlinePass();
    useResizeObserver(this.container, () => {
      this.resize();
    });
    window.addEventListener("resize", () => {
      this.resize();
    });
    this.model = await this.loadModel();
    this.render();
    if (this.model) {
      return new Promise<any>((resolve) => {
        resolve({ scene: this.scene });
      });
    } else {
      return new Promise<any>((resolve) => {
        resolve({ scene: this.scene });
      });
    }
  }
  render() {
    requestAnimationFrame((this.render as any).bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer?.render();
  }
  // 加载模型
  loadModel(url: string = this.modelUrl) {
    if (url) {
      return new Promise<any>((resolve, reject) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(dracoDecoderPath);
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load(
          url,
          (model: any) => {
            //模型的包围盒
            const box3 = new THREE.Box3().setFromObject(model.scene);
            // 获取包围盒中心
            const center = box3.getCenter(new THREE.Vector3());
            // 综合计算出模型的长度值，利用它设置相机位置
            const size = box3.getSize(new THREE.Vector3());
            const diagonal = size.length(); // 对角线长度
            const scaleRatio = Math.min(
              this.container.clientWidth / size.x,
              this.container.clientHeight / size.y
            );
            // 设置相机位置
            model.scene.scale.set(0.1, 0.1, 0.1);
            // 设置相机位置
            this.camera.position.set(diagonal, diagonal, diagonal);
            this.camera.lookAt(center);

            model.scene.name = "Model";
            this.scene.add(model.scene);
            modelScale(model.scene, scaleRatio);
            // modelRotate(model.scene, "y", -Math.PI / 4);
            // modelRotate(model.scene, "x", Math.PI / 9);
            resolve(model);
          },
          (xhr: ProgressEvent) => {
            // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (err) => {
            reject(err);
          }
        );
      });
    } else {
      return new Promise<any>((resolve) => {
        resolve(null);
      });
    }
  }
  // 加入射线点击
  initRaycaster() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dom = this.container;
    dom.addEventListener("click", (event) => {
      // dom的位置并不是从0开始的 需要转换
      const rect = dom.getBoundingClientRect();
      const start = event.clientX - rect.left;
      const top = event.clientY - rect.top;
      const x = (start / dom.clientWidth) * 2 - 1;
      const y = -(top / dom.clientHeight) * 2 + 1;
      mouse.set(x, y);
      raycaster.setFromCamera(mouse, this.camera);
      const objects = [];
      this.scene.traverseVisible((child) => {
        objects.push(child);
      });
      this.sceneHelper.traverseVisible((child) => {
        if (child.name === "picker") {
          objects.push(child);
        }
      });
      const intersects = raycaster.intersectObjects(objects, true);
      this.intersects = intersects;
      if (intersects.length > 0) {
        this.setOutlinePass(intersects[0].object);
        emitter.emit("selectNode", intersects[0].object);
      }
    });
  }
  // resize
  resize() {
    // 窗口宽高比
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    // 更新相机投影矩阵
    this.camera.updateProjectionMatrix();
    // 重置渲染器的尺寸
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }
  // 模型高光
  addOutlinePass() {
    this.outlinePass = outlinePass(
      this.scene,
      this.camera,
      this.container,
      this.composer
    );
  }
  // 设置高亮
  setOutlinePass(object: any) {
    setSelectedObject(object, this.outlinePass);
  }
}

const initHelper = (
  center: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
  model?: THREE.Group<THREE.Object3DEventMap>
) => {
  const gridHelper = new THREE.GridHelper(30, 30);
  gridHelper.name = "gridHelper";
  gridHelper.position.copy(center);
  gridHelper.position.y = 0;
  const axesHelper = new THREE.AxesHelper(30);
  axesHelper.name = "axesHelper";
  axesHelper.position.copy(center);
  if (model) {
    const boxHelper = new THREE.BoxHelper(model, 0xffff00);
    boxHelper.name = "boxHelper";
  }
  return {
    helper: {
      gridHelper,
      axesHelper,
    },
  };
};

const initScene = (container: HTMLElement) => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    // 抗锯齿
    antialias: true,
    // 透明背景
    alpha: true,
    logarithmicDepthBuffer: true, // 对数深度缓冲 模型闪烁
  });
  // HiDPI设备渲染
  renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  // 场景
  const scene = new THREE.Scene();
  scene.name = "Scene";
  scene.background = new THREE.Color(0xcccccc);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;

  // 控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true; // 阻尼系数
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN, // 左键拖拽
    MIDDLE: THREE.MOUSE.DOLLY, // 滑轮滚动
    RIGHT: THREE.MOUSE.ROTATE, // 右键旋转
  };
  controls.update();
  controls.addEventListener("change", () => {
    // console.log(controls.target);
    // console.log(camera.position);
  });

  // 光源
  const light = new THREE.AmbientLight(0xffffff, 1);
  light.name = light.type;
  scene.add(light);

  return {
    camera,
    renderer,
    scene,
    controls,
  };
};

const getAnimations = (model: GLTF, mixer: THREE.AnimationMixer) => {
  const actionsList: Array<THREE.AnimationAction> = [];
  for (let i = 0; i < model.animations.length; i++) {
    const action = mixer.clipAction(model.animations[i]);
    actionsList.push(action);
  }
  return actionsList;
};

const getBoxAndScale = (
  model: THREE.Group<THREE.Object3DEventMap>,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
) => {
  const box = new THREE.Box3().setFromObject(model); // 获取模型的包围盒
  const center = box.getCenter(new THREE.Vector3()); // 获取包围盒中心
  const size = box.getSize(new THREE.Vector3()); // 模型的长度值
  const scale = Math.max(size.x, size.y, size.z); // 缩放比例
  // 中心点三维向量 放大值
  const centerWithScale = center.clone().multiplyScalar(scale);
  // 盒子的放大值
  const sizeWithScale = size.clone().multiplyScalar(scale);
  // 模型缩放
  model.scale.set(scale, scale, scale);
  // 相机位置初始位置 缩放值
  camera.position.copy(sizeWithScale);
  // controls
  controls.target.copy(centerWithScale);

  return {
    box: { scale, sizeWithScale, centerWithScale },
  };
};

const cameraFlyAnimation = (camera: THREE.PerspectiveCamera, target: OrbitControls) => {
  const endPos = new THREE.Vector3(0, 0, 0);
  const endTarget = new THREE.Vector3(10, 10, 10);
  createCameraAnimation(camera, target, endPos, endTarget);
};

const dispose = (scene: THREE.Scene) => {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  });
  if (scene.background instanceof THREE.Texture) {
    scene.background.dispose();
  }
  scene.clear();
};

export {
  initScene,
  getAnimations,
  getBoxAndScale,
  cameraFlyAnimation,
  dispose,
  initHelper,
};
