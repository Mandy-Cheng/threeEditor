import THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/loaders/GLTFExporter.js';

const loader = new GLTFLoader();
const exporter = new GLTFExporter();

loader.load('model.gltf', (gltf) => {
    
  exporter.parse(gltf.scene, (result) => {
    console.log(result);
  });
});
```