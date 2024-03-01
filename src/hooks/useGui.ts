import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const gui = new GUI();
const cameraInteractor = gui.addFolder("Camera");
function createCameraInteractor(camera: THREE.PerspectiveCamera) {
  cameraInteractor
    .add(camera.position, "x")
    .min(-100)
    .max(100)
    .step(1)
    .name("x")
    .onChange(() => {
      console.log(camera.position.x);
    });
  cameraInteractor
    .add(camera.position, "y")
    .min(-100)
    .max(100)
    .step(1)
    .name("y")
    .onChange(() => {
      console.log(camera.position.y);
    });
  cameraInteractor
    .add(camera.position, "z")
    .min(-100)
    .max(100)
    .step(1)
    .name("z")
    .onChange(() => {
      console.log(camera.position.z);
    });
  cameraInteractor.add(camera, "fov").min(0).max(180).step(1).name("fov");
  cameraInteractor.add(camera, "near").min(0).max(100).step(1).name("near");
  cameraInteractor.add(camera, "far").min(0).max(10000).step(1).name("far");
}

export default function useGui() {
  return {
    gui,
    createCameraInteractor,
  };
}
