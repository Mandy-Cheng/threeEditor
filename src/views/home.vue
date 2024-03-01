<script setup lang="ts">
import ThreeScene from "@/hooks/useScene";
import { cameraFlyAnimation } from "@/hooks/useScene";
import useIndexedDB from "@/hooks/useIndexDb";
const treeData = ref<any>([]);
const containerRef = ref<any>(null);
const treePanelRef = ref<any>(null);
const { getModelFromIndexDb } = useIndexedDB();
let threeScene = null as any;
async function init() {
  const gltf = await getModelFromIndexDb("xsw");
  if (gltf) {
    threeScene = new ThreeScene({
      container: containerRef.value,
      modelUrl: gltf,
      tree: treePanelRef.value?.treeRef,
    });
    const { scene } = await threeScene.init();
    treeData.value = [scene];
  } else {
    console.log("没有模型");
  }
}

function cameraMove() {
  cameraFlyAnimation(threeScene.camera, threeScene.controls);
}

onMounted(async () => {
  init();
});

onBeforeUnmount(() => {
  threeScene.dispose();
});
</script>

<template>
  <div class="flex-row-1 h-100vh">
    <div class="flex-column-2 w-25% b-r b-coolGray h-full">
      <sc-upload @load="init"></sc-upload>
      <sc-panel
        :treeData="treeData"
        :scene="threeScene"
        ref="treePanelRef"
      ></sc-panel>
    </div>
    <div class="w-75% h-100vh">
      <div id="three_container" ref="containerRef" class="w-100% h-100vh"></div>
    </div>
  </div>
  <div class="absolute left-35% top-0px p-10px">
    <el-button type="primary" @click="cameraMove" class="mb-10px"
      >camerMove</el-button
    >
  </div>
</template>

<style scoped></style>
