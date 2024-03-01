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
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// 伽马校正后处理Shader
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

import useTexture from "@/hooks/useTexture.ts";
import useStats from "@/hooks/useStats.ts";
const { DarkBlueTexture } = useTexture();
const { createStatsPanel } = useStats();

const containerRef = ref<any>(null);

onMounted(() => {
  init();
});

function init() {
  const container = containerRef.value;
  const stats = createStatsPanel();

  if (container) {
    container.appendChild(stats.dom);
    const scene = new THREE.Scene();
    scene.background = DarkBlueTexture;
    scene.environment = DarkBlueTexture;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.value.clientWidth / containerRef.value.clientHeight,
      0.1,
      5000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true, // 对数深度缓冲 模型闪烁
    });
    // 抗锯齿
    renderer.setPixelRatio(window.devicePixelRatio);
    const pixelRatio = renderer.getPixelRatio();
    console.log(scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN, // 左键拖拽
      MIDDLE: THREE.MOUSE.DOLLY, // 滑轮滚动
      RIGHT: THREE.MOUSE.ROTATE, // 右键旋转
    };
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
    // createCube();
    createLight();
    createComposer();
    animate();
    loadModel();
    initRaycaster();
    // document.addEventListener("mousedown", onDocumentMouseDown, false);

    function createCube() {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({
        // 金属度
        metalness: 0.9,
        // 粗糙度
        roughness: 0.1,
        // 设置环境贴图
        envMap: DarkBlueTexture,
      });
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
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
      //   抗锯齿
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.uniforms.resolution.value.x =
        1 / (container.clientWidth * pixelRatio);
      fxaaPass.uniforms.resolution.value.y =
        1 / (container.clientHeight * pixelRatio);
      // composer.addPass(fxaaPass);
      // SMAA抗锯齿通道
      const smaaPass = new SMAAPass(
        container.clientWidth * pixelRatio,
        container.clientHeight * pixelRatio
      );
      composer.addPass(smaaPass);
      //  伽马校正
      const gammaPass = new ShaderPass(GammaCorrectionShader);
      composer.addPass(gammaPass);
      composer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
      stats.update();
      requestAnimationFrame(animate);
      // renderer.render(scene, camera);
      composer.render();
    }

    function adjustModelAndCamera(gltf) {
      const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
      const diagonal = size.length(); // 对角线长度
      const scaleRatio = Math.min(
        container.clientWidth / size.x,
        container.clientHeight / size.y
      );
      // 设置相机位置
      gltf.scene.scale.set(scaleRatio, scaleRatio, scaleRatio);
      camera.position.set(diagonal, diagonal, diagonal);
      camera.lookAt(center);
    }

    // 加载模型
    function loadModel() {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/draco/");
      dracoLoader.preload(); // 缓存解码器
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        "/model/fthy/ls_fthy_house_v1.glb",
        (gltf) => {
          scene.add(gltf.scene);
          adjustModelAndCamera(gltf);
        },
        (xhr: ProgressEvent) => {
          // console.log(xhr);
          // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.error(error);
        }
      );
    }

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

    window.addEventListener("resize", () => {
      camera.aspect =
        containerRef.value?.clientWidth / containerRef.value?.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.value?.clientWidth,
        containerRef.value?.clientHeight
      );
    });
  }
}
</script>

<template>
  <div id="three_container" ref="containerRef" class="w-full h-100vh"></div>
</template>
