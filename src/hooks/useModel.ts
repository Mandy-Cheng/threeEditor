import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const saveArrayBuffer = (buffer: any, filename: any) => {
  // 将二进制数据保存为文件
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  console.log("导出成功");
};

const saveString = (text: any, filename: any) => {
  // 将字符串数据保存为文件
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  console.log("导出成功");
};

const type = "glb";

export function exportFunc(scene: THREE.Group) {
  // 导出模型
  const exporter = new GLTFExporter();
  const options = {
    trs: false, // 是否保留位置、旋转、缩放信息
    binary: type == "glb" ? true : false, // 是否以二进制格式输出
    // animations: scene.modelAnimation,
    forceIndices: false, // 是否强制输出索引
    forcePowerOfTwoTextures: false, // 是否强制输出2的幂次方纹理
    maxTextureSize: Infinity, // 最大纹理尺寸
    maxTextureUnits: 16, // 最大纹理单元
    optimizeForCaching: true, // 是否优化缓存
    includeCustomExtensions: true, // 是否包括自定义扩展

  };
  exporter.parse(
    scene,
    (result: any) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, "scene.glb");
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, "scene.gltf");
      }
    },
    (err: any) => {
      console.error(err);
    },
    options
  );
}

export function changeNameByHash(hash: Object, scene: THREE.Group) {
  const map = new Map(Object.entries(hash));
  scene.traverse((child: any) => {
    if (child.material && map.has(child.material.name)) {
      child.parent.name = map.get(child.material.name);
    }
  });
}

export function moveNodeGroupByName(
  nodeName: string,
  groupName: string,
  scene: THREE.Group
) {
  const group = scene.getObjectByName(groupName);
  const nodes = scene.getObjectsByProperty("name", nodeName);
  console.log("men", nodes);
  if (group && nodes) {
    nodes.forEach((node) => {
      group.add(node);
      scene.remove(node);
    });

    scene.add(group);
  } else {
    console.error("未找到group或者node");
  }
}

export function addGroup(name?: string, scene: THREE.Group) {
  const group = new THREE.Group();
  group.name = name || "group";
  scene.add(group);
}

export default function useModel() {
  return {
    exportFunc,
    changeNameByHash,
    moveNodeGroupByName,
    addGroup,
  };
}
