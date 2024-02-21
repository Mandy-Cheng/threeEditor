<script setup lang="ts">
// 创建一个threejs的场景 添加一个立方体 轮廓高亮发光
// 1. 创建一个场景
// 2.创建一个相机
// 3. 创建一个渲染器
// 4. 创建一个立方体
// 5. 创建一个光源
// 6.创建一个控制器
// 7. 创建一个outlinePass让立方体轮廓发光
// 8. 加载模型点击模型高亮
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const containerRef = ref<any>(null);

onMounted(() => {
  init();
});

function init() {
  const container = containerRef.value;
  if (container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.value.clientWidth / containerRef.value.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const controls = new OrbitControls(camera, renderer.domElement);
    const composer = new EffectComposer(renderer);

    let cube: THREE.Mesh;
    let light: THREE.AmbientLight;

    const outlinePass = new OutlinePass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      scene,
      camera
    );

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    camera.position.z = 5;
    controls.update();
    createCube();
    createLight();
    createComposer();
    animate();
    loadModel();
    initRaycaster();
    // document.addEventListener("mousedown", onDocumentMouseDown, false);

    function createCube() {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      cube = new THREE.Mesh(geometry, material);
      //   scene.add(cube);
    }

    function createLight() {
      light = new THREE.AmbientLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      scene.add(light);
    }

    function createComposer() {
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(outlinePass);
      outlinePass.edgeStrength = 5;
      outlinePass.edgeGlow = 0;
      outlinePass.edgeThickness = 1;
      outlinePass.visibleEdgeColor.set("red");
      outlinePass.hiddenEdgeColor.set("red");
      //   高亮物体为cube
      composer.addPass(new ShaderPass(FXAAShader));
      composer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      composer.render();
    }

    // 加载模型
    function loadModel() {
      const loader = new GLTFLoader();
      loader.load(
        "public/model/BJ_xswnq_station/bjjn_xswbq.glb",
        (gltf) => {
          gltf.scene.scale.set(0.1, 0.1, 0.1);
          scene.add(gltf.scene);
        },
        undefined,
        (error) => {
          console.error(error);
        }
      );
    }

    // 模型点击高亮
    // function onDocumentMouseDown(event: MouseEvent) {
    //   event.preventDefault();
    //   const mouse = new THREE.Vector2();
    //   const raycaster = new THREE.Raycaster();
    //   mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    //   mouse.y = -(event.clientY / container.clientWidth) * 2 + 1;
    //   raycaster.setFromCamera(mouse, camera);
    //   const intersects = raycaster.intersectObjects(scene.children, true);
    //   if (intersects.length > 0) {
    //     const object = intersects[0].object;
    //     outlinePass.selectedObjects = [object];
    //   }
    // }
    function initRaycaster() {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const dom = renderer.domElement;
      dom.addEventListener("click", (event) => {
        const x = (event.clientX / dom.clientWidth) * 2 - 1;
        const y = -(event.clientY / dom.clientHeight) * 2 + 1;
        mouse.set(x, y);
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          const object = intersects[0].object;
          outlinePass.selectedObjects = [object];
        }
        console.log(intersects);
      });
    }
  }
}
</script>

<template>
  <div id="three_container" ref="containerRef" class="w-800px h-800px"></div>
</template>
