// 创建threejs类 包括场景、相机、渲染器、光源、控制器等
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useResizeObserver } from "@vueuse/core";
import { OutlinePass, RoomEnvironment } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import useComposer from "@/hooks/useComposer.ts";
import useModel from "@/hooks/useModel.ts";
import useTree from "@/hooks/useTree.ts";
const { outlinePass } = useComposer();
const { setSelectedObject } = useModel();
const { setCheckedNodes } = useTree();

export default class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  container: HTMLElement;
  tree?: InstanceType<typeof ElTree>;
  nodeTree: Array<any>[] = [];
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
      this.scene.add(this.model.scene);
      return new Promise<any>((resolve) => {
        resolve({ nodeTree: this.model?.scenes });
      });
    } else {
      return new Promise<any>((resolve) => {
        resolve({ nodeTree: [] });
      });
    }
  }
  render() {
    requestAnimationFrame((this.render as any).bind(this));
    this.composer?.render();
  }
  // 加载模型
  loadModel(url: string = this.modelUrl) {
    if (url) {
      const dracoroader = new DRACOLoader();
      const loader = new GLTFLoader();
      dracoroader.setDecoderPath("/examples/jsm/libs/draco/gltf/");
      loader.setDRACOLoader(dracoroader);
      return new Promise<any>((resolve, reject) => {
        loader.load(
          url,
          (model: any) => {
            //模型的包围盒
            const box3 = new THREE.Box3().setFromObject(model.scene);
            // 获取包围盒中心
            const center = box3.getCenter(new THREE.Vector3());
            // 综合计算出模型的长度值，利用它设置相机位置
            const size = box3.getSize(new THREE.Vector3()).length();
            // 设置相机位置
            this.camera.position.set(size, size, size);
            this.camera.lookAt(center);
            this.nodeTree = model.scene.children;
            const { helper } = initHelper(center, model.scene);
            this.sceneHelper.add(helper.gridHelper);
            this.scene.add(this.sceneHelper);
            resolve(model);
          },
          undefined,
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
        if (child.type === "Scene") return;
        if (child.name === "Scene") return;
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
        setCheckedNodes(this.tree, intersects[0].object);
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
  center: THREE.Vector3,
  model: THREE.Group<THREE.Object3DEventMap>
) => {
  const gridHelper = new THREE.GridHelper(30, 30);
  gridHelper.position.copy(center);
  gridHelper.position.y = 0;
  const axesHelper = new THREE.AxesHelper(30);
  axesHelper.position.copy(center);
  const boxHelper = new THREE.BoxHelper(model, 0xffff00);
  return {
    helper: {
      gridHelper,
      axesHelper,
      boxHelper,
    },
  };
};

const initScene = (container: HTMLElement) => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  // 创建相机
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    // 抗锯齿
    antialias: true,
    // 透明背景
    alpha: true,
  });
  // HiDPI设备渲染
  renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  // 场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;

  // 控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 惯性功能
  controls.enablePan = true; // 右键拖拽
  controls.enableZoom = true; // 阻尼系数
  controls.update();
  // controls.addEventListener("change", () => {
  //   renderer.render(scene, camera);
  // })

  // 光源
  const light = new THREE.AmbientLight(0xffffff, 1);
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
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = box.getSize(new THREE.Vector3()).length();
  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();
  camera.position.copy(center);
  camera.position.x += size / 2.0;
  camera.position.y += size / 5.0;
  camera.position.z += size / 2.0;
  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
  return {
    box,
    center,
    size,
  };
};
