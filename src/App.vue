<script setup lang="ts">
import ThreeScene from "./hooks/useScene";
import { ref, onMounted } from "vue";
import ScTree from "./components/ScTree.vue";
import ScUpload from "./components/ScUpload.vue";
import useIndexedDB from "@/hooks/useIndexDb";

const treeData = ref<any>([]);
const containerRef = ref<any>(null);
const { getModelFromIndexDb } = useIndexedDB();

async function init() {
  const gltf = await getModelFromIndexDb("xsw");
  if (gltf) {
    const threeScene = new ThreeScene({
      container: containerRef.value,
      gltf: gltf,
    });
    const { nodeTree } = await threeScene.init();
    treeData.value = nodeTree;
  } else {
    console.log("没有模型");
  }
}

onMounted(async () => {
  init();
});
</script>

<template>
  <div class="flex-row-1 h-100vh">
    <div class="flex-column-2 w-35% b-r b-coolGray h-full">
      <sc-upload @load="init"></sc-upload>
      <sc-tree :treeData="treeData"></sc-tree>
    </div>
    <div class="w-65% h-100vh">
      <div id="three_container" ref="containerRef" class="w-100% h-100vh"></div>
    </div>
  </div>
</template>

<style scoped></style>
