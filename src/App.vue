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
  console.log(gltf);
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
  <div class="flex-row-1 h-full">
    <div class="flex-column-2">
      <sc-tree :treeData="treeData"></sc-tree>
      <sc-upload @load="init"></sc-upload>
    </div>
    <div
      id="three_container"
      ref="containerRef"
      class="w-[calc(100vw-360px)] h-100vh"
    ></div>
  </div>
</template>

<style scoped></style>
