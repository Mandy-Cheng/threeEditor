<template>
  <n-space
    vertical
    class="p-y-20px p-x-10px box-border w-full w-min-300px zIndex-999"
  >
    <div>
      <el-button type="primary" @click="changeByHash">ChangeByHash</el-button>
      <el-button type="primary" @click="resetTree">reset</el-button>
      <el-button type="primary" @click="add">addGroup</el-button>
      <el-button type="primary" @click="moveNodeByHash">move</el-button>
      <el-button type="primary" @click="exportMethod">export</el-button>
    </div>
    <el-input v-model="pattern" placeholder="搜索" />
    <el-scrollbar class="h-[calc(100vh-300px)] w-full">
      <el-tree
        ref="treeRef"
        class="w-full p-b-20px"
        draggable
        :data="treeDataIn"
        node-key="id"
        :renderContent="renderLabel"
        :filter-node-method="filterNode"
        :default-expanded-keys="defaultExpandedKeys"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <a @click="toggleVisible(data)"> rename </a>
            </span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </n-space>
</template>
<script lang="ts" setup>
import { ref, toRef, defineProps, watch, withModifiers, triggerRef } from "vue";
import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
import { get } from "@runafe/platform-share";
import { ElTree, ElIcon } from "element-plus";
import useModel from "../hooks/useModel";
import { EyeOutline, EyeOffOutline, ArrowUp } from "@vicons/ionicons5";
const { changeNameByHash, moveNodeGroupByName, addGroup, exportFunc } =
  useModel();
const props = withDefaults(
  defineProps<{
    treeData: THREE.Group[];
  }>(),
  { treeData: () => [] }
);
const treeRef = ref<InstanceType<typeof ElTree>>();
const treeDataOrigin = props.treeData;
const defaultExpandedKeys = ref<number[]>([]);
let treeDataIn = toRef(props, "treeData");

const pattern = ref("");
const filterNode = (pattern: string, node: TreeNodeData) => {
  if (!pattern) return true;
  const name = node.name as string;
  return name.includes(pattern);
};
const colorHash = {
  Other: { type: "groupOrObject3D", color: "#8888ee", alias: "" },
  Geometry: { type: "geometry", color: "#FF0000", alias: "geometry" },
  Mesh: { type: "mesh", color: "#aaeeaa", alias: "material" },
};
const colorEntries = Object.entries(colorHash);
const createLabel = (node: TreeNodeData) => {
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
const toggleVisible = (data: TreeNodeData) => {
  data.visible = !data.visible;
};
const renderLabel = (
  h: any,
  {
    data,
  }: {
    data: TreeNodeData;
  }
) => {
  return h(
    "div",
    {
      class: "flex-row-46 w-full p-y-5px",
    },
    h("span", { innerHTML: createLabel(data) }),
    h("div", { class: "flex-row-46" }, [
      data.name === "Scene"
        ? null
        : h(
            ElIcon,
            {
              class: "mr-40px color-#4194fc",
              onClick: withModifiers(
                () => moveTop(data, treeDataIn.value[0].children as any[]),
                ["stop", "prevent"]
              ),
            },
            {
              default: () => h(ArrowUp),
            }
          ),
      h(
        ElIcon,
        {
          class: "mr-40px color-#4194fc",
          onClick: withModifiers(
            () => toggleVisible(data),
            ["stop", "prevent"]
          ),
        },
        {
          default: () => h(data.visible ? EyeOutline : EyeOffOutline),
        }
      ),
    ])
  );
};

const hash = {
  dingmian: "顶面",
  dimian: "地面",
  shuini: "外墙",
  // hui: "门",
  boli: "窗",
  caopi: "草皮",
};

const changeByHash = () => {
  changeNameByHash(hash, treeDataIn.value[0]);
};
const resetTree = () => {
  treeDataIn.value = treeDataOrigin;
};
const moveNodeByHash = () => {
  const names = Object.values(hash);
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

const moveTop = (data: TreeNodeData, array: any[]) => {
  const index = array.findIndex((item: any) => item.id === data.id);
  if (index === 0) return;
  const item = array.splice(index, 1);
  array.unshift(item[0]);
  console.log(array);
  triggerRef(treeDataIn);
};

watch(pattern, (val) => {
  treeRef.value!.filter(val);
});

watch(
  () => props.treeData,
  (val) => {
    defaultExpandedKeys.value = [val[0]?.id];
  }
);
</script>
<style scoped>
.el-scrollbar__wrap {
  overflow-x: auto;
}
</style>
