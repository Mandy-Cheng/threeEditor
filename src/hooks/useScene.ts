// 创建threejs类 包括场景、相机、渲染器、光源、控制器等
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  light: THREE.AmbientLight;
  container: HTMLElement;
  gltf: {};
  constructor(options: { container: HTMLElement }) {
    this.container = options.container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.light = new THREE.AmbientLight(0xffffff, 1);
    // 场景背景色
    this.scene.background = new THREE.Color(0xcccccc);
  }
  async init() {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.camera.position.z = 20;
    this.light.position.set(1, 1, 1).normalize();
    this.scene.add(this.light);
    this.initControls();
    this.gltf = await this.loadModel();
    this.initRaycaster();
    this.container.appendChild(this.renderer.domElement);
    return new Promise<any>((resolve) => {
      resolve({ nodeTree: this.gltf.scenes });
    });
  }
  render() {
    this.renderer?.render(this.scene, this.camera);
    requestAnimationFrame((this.render as any).bind(this));
  }
  loadModel() {
    const loader = new GLTFLoader();
    return new Promise<any>((resolve, reject) => {
      loader.load(
        "/model/BJ_xswnq_station/bj-xswnqzhan4.glb",
        (gltf: any) => {
          const box = new THREE.Box3().setFromObject(gltf.scene);
          // 计算模型中心点
          const center = box.getCenter(new THREE.Vector3());
          this.scene.add(gltf.scene);
          this.render();
          this.nodeTree = gltf.scene.children;
          console.log(gltf);
          resolve(gltf);
        },
        undefined,
        (err) => {
          reject(err);
        }
      );
    });
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
      //   点击显示helper框选当前点击的物体 之前的helper清除
      this.scene.children.forEach((item) => {
        if (item.name === "helper") {
          this.scene.remove(item);
        }
      });
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const helper = new THREE.BoxHelper(intersect.object, 0xffff00);
        helper.name = "helper";
        this.scene.add(helper);
      }
    });
  }
}
