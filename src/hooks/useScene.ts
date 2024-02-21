// 创建threejs类 包括场景、相机、渲染器、光源、控制器等
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useResizeObserver } from "@vueuse/core";
import { RoomEnvironment } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import useComposer from "@/hooks/useComposer.ts";
import useModel from "@/hooks/useModel.ts";
const { outlinePass } = useComposer();
const { setSelectedObject } = useModel();

export default class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  container: HTMLElement;
  nodeTree: Array<any>[] = [];
  gltf: any;
  modelUrl: string;
  composer: any;
  outlinePass: any;
  constructor(options: { container: HTMLElement; modelUrl?: any }) {
    this.container = options.container;
    this.scene = new THREE.Scene();
    this.modelUrl = options.modelUrl;
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.composer = new EffectComposer(this.renderer);
    this.scene.background = new THREE.Color(0xcccccc);
  }
  async init() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.initControls();
    this.initRaycaster();
    this.loadEnv();
    this.addGridHelper();
    this.addOutlinePass();
    useResizeObserver(this.container, () => {
      this.resize();
    });
    window.addEventListener("resize", () => {
      this.resize();
    });
    this.container.appendChild(this.renderer.domElement);
    this.gltf = await this.loadModel();
    this.addLight();
    this.render();
    if (this.gltf) {
      this.scene.add(this.gltf.scene);
      return new Promise<any>((resolve) => {
        console.log(this.outlinePass);
        resolve({ nodeTree: this.gltf.scenes, outlinePass: this.outlinePass });
      });
    } else {
      return new Promise<any>((resolve) => {
        resolve({ nodeTree: [] });
      });
    }
  }
  render() {
    requestAnimationFrame((this.render as any).bind(this));
    this.composer.render();
  }
  // 加载灯光
  addLight() {
    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
  }
  // 加载模型
  loadModel(url: string = this.modelUrl) {
    if (url) {
      const loader = new GLTFLoader();
      return new Promise<any>((resolve, reject) => {
        loader.load(
          url,
          (gltf: any) => {
            //模型的包围盒
            const box3 = new THREE.Box3().setFromObject(gltf.scene);
            // 获取包围盒中心
            const center = box3.getCenter(new THREE.Vector3());
            // 综合计算出模型的长度值，利用它设置相机位置
            const size = box3.getSize(new THREE.Vector3()).length();
            // 设置相机位置
            this.camera.position.set(size, size, size);
            this.camera.lookAt(center);
            this.nodeTree = gltf.scene.children;
            resolve(gltf);
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
  // 加入鼠标控制
  initControls() {
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
  }
  // 加入射线点击
  initRaycaster() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dom = this.renderer.domElement;
    dom.addEventListener("click", (event) => {
      const x = (event.clientX / dom.clientWidth) * 2 - 1;
      const y = -(event.clientY / dom.clientHeight) * 2 + 1;
      mouse.set(x, y);
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        this.setOutlinePass(object);
      }
    });
  }
  // resize
  resize() {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }
  // loadEnv
  loadEnv() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const env = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(env, 0.04).texture;
  }
  // add AxesHelper 辅助坐标系
  addAxesHelper() {
    const axesHelper = new THREE.AxesHelper(50);
    this.scene.add(axesHelper);
  }
  // addGridHelper 辅助网格
  addGridHelper() {
    const gridHelper = new THREE.GridHelper(40, 40);
    this.scene.add(gridHelper);
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
