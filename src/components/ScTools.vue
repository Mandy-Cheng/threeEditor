<template>
  <div class="h-150px b-b-1px b-#dcdfe6 b-b-dashed pb-10px">
    <el-scrollbar>
      <div class="flex-row-46">
        <div>
          <n-dynamic-input
            v-model:value="hash"
            preset="pair"
            key-placeholder="材料名称"
            value-placeholder="修改名称"
            size="mini"
          />
        </div>
        <div>
          <el-button
            type="primary"
            @click="changeByHash"
            class="ml-10px mb-10px"
            >ChangeName</el-button
          >
          <el-button type="primary" @click="add" class="mb-10px"
            >addGroup</el-button
          >
          <el-button type="primary" @click="moveNodeByHash" class="mb-10px"
            >move</el-button
          >
          <el-button type="primary" @click="exportMethod" class="mb-10px"
            >export</el-button
          >
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import useModel from "../hooks/useModel";
const { changeNameByHash, moveNodeGroupByName, addGroup, exportFunc } =
  useModel();
const props = withDefaults(
  defineProps<{
    treeData: THREE.Group[];
  }>(),
  { treeData: () => [] }
);
const treeDataIn = toRef(props, "treeData");

const hash = ref([
  {
    key: "dingmian",
    value: "顶面",
  },
  {
    key: "dimian",
    value: "地面",
  },
  {
    key: "shuini",
    value: "外墙",
  },
  {
    key: "boli",
    value: "窗",
  },
  {
    key: "caopi",
    value: "草皮",
  },
]);

const changeByHash = () => {
  changeNameByHash(hash.value, treeDataIn.value[0]);
};

const moveNodeByHash = () => {
  // 提取hash每一项的value成数组
  const names = hash.value.map((item) => item.value);
  names.forEach((name) => {
    moveNodeGroupByName(name, "Node", treeDataIn.value[0]);
  });
};

const exportMethod = () => {
  exportFunc(treeDataIn.value[0]);
};

const add = () => {
  addGroup("Node", treeDataIn.value[0]);
};
</script>
