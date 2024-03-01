import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 模型入场旋转动画 给个角度 默认45
export const modelRotate = (model: any, dir: string, angle = Math.PI / 4) => {
  gsap.to(model.rotation, {
    duration: 3,
    [dir]: angle,
    ease: "power4.out",
  });
};

// 模型scale动画
export const modelScale = (model: any, scale = 1) => {
  gsap.to(model.scale, {
    duration: 3,
    x: scale,
    y: scale,
    z: scale,
    ease: "power4.out",
  });
};

function createCameraAnimation(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  endPos: { x: number; y: number; z: number },
  endTarget: { x: number; y: number; z: number },
  tlOptions?: any,
  options?: any
) {
  return new Promise((resolve) => {
    const tl = gsap.timeline({ ...(tlOptions || {}) });
    const animation = tl
      .to(camera.position, {
        duration: 3,
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        ease: "power4.out",
        ...(options || {}),
      })
      .to(controls.target, {
        duration: 3,
        x: endTarget.x,
        y: endTarget.y,
        z: endTarget.z,
        ease: "power4.out",
        ...(options || {}),
      });
    resolve(animation);
  });
}

export default function useAmination() {
  return {
    modelRotate,
    modelScale,
    createCameraAnimation,
  };
}
