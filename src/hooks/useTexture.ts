import * as THREE from "three";

const baseUrl = `${import.meta.env.VITE_PUBLIC_PATH}textures/`;

const DarkBlueTexture = new THREE.CubeTextureLoader()
  .setPath(`${baseUrl}darkBlue/`)
  .load([
    "posx.jpg",
    "negx.jpg",
    "posy.jpg",
    "negy.jpg",
    "posz.jpg",
    "negz.jpg",
  ]);
DarkBlueTexture.name = "DarkBlueTexture";


export default function useTexture() {
  return {
    DarkBlueTexture,
  };
}
