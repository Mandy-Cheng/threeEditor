import * as THREE from "three";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

function outlinePass(
  scene: any,
  camera: any,
  container: HTMLElement = document.body,
  composer: any
) {
  // 渲染通道
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  let outlinePass = new OutlinePass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    scene,
    camera,
  );

  outlinePass.edgeStrength = 5;
  outlinePass.edgeGlow = 0;
  outlinePass.edgeThickness = 1;
  outlinePass.visibleEdgeColor.set("red");
  outlinePass.hiddenEdgeColor.set("red");
  //   解决高亮后环境变暗的问题
  const outputPass = new OutputPass();
  //  抗锯齿
  const effectFXAA = new ShaderPass(FXAAShader);
  //  设置分辨率
  effectFXAA.uniforms["resolution"].value.set(
    1 / container.clientWidth,
    1 / container.clientHeight
  );
  //  设置是否渲染到屏幕
  effectFXAA.renderToScreen = true;
  composer.addPass(outlinePass);
  composer.addPass(outputPass);
  composer.addPass(effectFXAA);
  composer.setSize(container.clientWidth, container.clientHeight);
  return outlinePass;
}

export default function useComposer() {
  return {
    outlinePass,
  };
}
