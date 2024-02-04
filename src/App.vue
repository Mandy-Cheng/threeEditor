<script setup lang="ts">
import ThreeScene from "./hooks/useScene";
import { ref, onMounted } from "vue";
import ScTree from "./components/ScTree.vue";
const treeData = ref<any>([]);
const containerRef = ref<any>(null);

onMounted(async () => {
  const threeScene = new ThreeScene({ container: containerRef.value });
  const { nodeTree } = await threeScene.init();
  treeData.value = nodeTree;
});
</script>

<template>
  <div class="flex-row-1 h-full">
    <sc-tree :treeData="treeData"></sc-tree>
    <div
      id="three_container"
      ref="containerRef"
      class="w-[calc(100vw-360px)] h-100vh"
    ></div>
  </div>
</template>

<style scoped></style>
