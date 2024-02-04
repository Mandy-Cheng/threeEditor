<template>
  <n-space vertical class="p-y-20px p-x-10px box-border w-340px">
    <n-input v-model:value="pattern" placeholder="搜索" />
    <el-scrollbar class="h-[calc(100vh-80px)]">
      <!-- <n-tree
        :data="treeDataIn"
        key-field="uuid"
        :render-label="renderLabel"
        multiple
        draggable
        block-line
        cancelable
        keyboard
        :getChildren="getChildren"
        :pattern="pattern"
        :filter="filterNode"
        @drop="handleDrop"
        :render-switcher-icon="renderSwitcherIcon"
      ></n-tree> -->
      <el-tree
        class="w-300px"
        draggable
        :data="treeDataIn"
        :data="treeDataIn"
        :props="{ label: 'name', key: 'uuid' }"
        :render-content="renderLabel"
      ></el-tree>
    </el-scrollbar>
  </n-space>
</template>
<script lang="ts" setup>
import { ref, toRef, defineProps, h } from "vue";
import { TreeOption, TreeDropInfo } from "naive-ui";
import { ChevronForward } from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import { get } from "@runafe/platform-share";
import { repeat } from "seemly";
const props = withDefaults(
  defineProps<{
    treeData: TreeOption[];
  }>(),
  { treeData: () => [] }
);

let treeDataIn = toRef(props, "treeData");
const pattern = ref("");
const getChildren = (node: TreeOption) => {
  if (node.children && node.children.length > 0) return node.children;
};
const colorHash = {
  Other: { type: "groupOrObject3D", color: "#8888ee", alias: "" },
  Geometry: { type: "geometry", color: "#FF0000", alias: "geometry" },
  Mesh: { type: "mesh", color: "#aaeeaa", alias: "material" },
};
const colorEntries = Object.entries(colorHash);
const createLabel = (node: TreeOption) => {
  const spans = colorEntries.map((item) => {
    const name = get(node, [`${item[1]?.alias}`, "name"], "") as string;
    const nameSpan = name
      ? `<div class="inline-block m-x-10px" data-type=${item[1].type} style="color:${item[1]?.color}">●</div>${name}`
      : "";
    const i = { ...item[1], nameSpan };
    return [item[0], i];
  });
  return spans
    .map((item) => {
      return item[1]["nameSpan" as keyof (typeof item)[1]];
    })
    .join("");
};
const renderLabel = ({ option }: { option: TreeOption }) => {
  return h("div", {
    props: {
      class: "flex-row-4",
    },
    innerHTML: createLabel(option),
  });
};
const renderSwitcherIcon = () => {
  return h(NIcon, null, { default: () => h(ChevronForward) });
};
const filterNode = (pattern: string, node: TreeOption) => {
  if (!pattern) return true;
  const name = node.name as string;
  return name.includes(pattern);
};
function findSiblingsAndIndex(
  node: TreeOption,
  nodes?: TreeOption[]
): [TreeOption[], number] | [null, null] {
  if (!nodes) return [null, null];
  for (let i = 0; i < nodes.length; ++i) {
    const siblingNode = nodes[i];
    if (siblingNode.key === node.key) return [nodes, i];
    const [siblings, index] = findSiblingsAndIndex(node, siblingNode.children);
    if (siblings && index !== null) return [siblings, index];
  }
  return [null, null];
}

const dataRef = treeDataIn;

function handleDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
  const [dragNodeSiblings, dragNodeIndex] = findSiblingsAndIndex(
    dragNode,
    dataRef.value
  );
  if (dragNodeSiblings === null || dragNodeIndex === null) return;
  dragNodeSiblings.splice(dragNodeIndex, 1);
  if (dropPosition === "inside") {
    if (node.children) {
      node.children.unshift(dragNode);
    } else {
      node.children = [dragNode];
    }
  } else if (dropPosition === "before") {
    const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(node, dataRef.value);
    if (nodeSiblings === null || nodeIndex === null) return;
    nodeSiblings.splice(nodeIndex, 0, dragNode);
  } else if (dropPosition === "after") {
    const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(node, dataRef.value);
    if (nodeSiblings === null || nodeIndex === null) return;
    nodeSiblings.splice(nodeIndex + 1, 0, dragNode);
  }
  // dataRef.value = Array.from(dataRef.value); // trigger change
}
</script>
