<script setup lang="ts">
import ThreeScene from "@/hooks/useScene";
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
    const { nodeTree } = await threeScene.init();
    treeData.value = nodeTree;
  } else {
    console.log("没有模型");
  }
}

function select(node: any) {
  threeScene?.setOutlinePass(node);
}

onMounted(async () => {
  init();
});
</script>

<template>
  <div class="flex-row-1 h-100vh">
    <div class="flex-column-2 w-25% b-r b-coolGray h-full">
      <sc-upload @load="init"></sc-upload>
      <sc-tree
        :treeData="treeData"
        @select="select"
        ref="treePanelRef"
      ></sc-tree>
    </div>
    <div class="w-75% h-100vh">
      <div id="three_container" ref="containerRef" class="w-100% h-100vh"></div>
    </div>
  </div>
</template>

<style scoped></style>
