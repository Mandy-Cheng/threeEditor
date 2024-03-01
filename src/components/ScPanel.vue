<template>
  <n-space
    vertical
    class="p-y-20px p-x-10px box-border w-full w-min-300px zIndex-999"
  >
    <sc-tools :treeData="treeDataIn" />
    <sc-tree
      :treeData="treeDataIn"
      @select="select"
      ref="filterTreeRef"
    ></sc-tree>
    <!-- <sc-property :property="currentNode" /> -->
  </n-space>
</template>
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    treeData: THREE.Group[];
    outlinePass: any;
    scene: any;
  }>(),
  { treeData: () => [], outlinePass: () => {}, scene: () => {} }
);
const emit = defineEmits(["select"]);
const filterTreeRef = ref<InstanceType<typeof ElTree>>();
let treeDataIn = toRef(props, "treeData");
const sceneIn = toRef(props, "scene");
const select = (node: any) => {
  sceneIn.value.setOutlinePass(node);
};
defineExpose({
  filterTreeRef,
});
</script>
<style scoped>
.el-scrollbar__wrap {
  overflow-x: auto;
}
</style>
