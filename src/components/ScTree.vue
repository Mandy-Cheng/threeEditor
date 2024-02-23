<template>
  <n-space
    vertical
    class="p-y-20px p-x-10px box-border w-full w-min-300px zIndex-999"
  >
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
            <el-button type="primary" @click="resetTree" class="mb-10px"
              >reset</el-button
            >
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-input v-model="pattern" placeholder="搜索">
      <template #prepend>
        <el-select
          v-model="filterType"
          placeholder="Select"
          style="width: 115px"
          @change="selectChange"
        >
          <el-option label="Object3D" value="1" />
          <el-option label="Material" value="2" />
        </el-select>
      </template>
    </el-input>
    <div class="h-[calc(100vh-500px)] w-full b-b-1px b-#dcdfe6 b-b-dashed">
      <el-scrollbar>
        <el-tree
          ref="treeRef"
          class="w-full p-b-20px"
          draggable
          :data="treeDataIn"
          node-key="id"
          :renderContent="renderLabel"
          :filter-node-method="filterNode"
          :highlight-current="true"
          :default-expanded-keys="defaultExpandedKeys"
          @node-click="handleNodeClick"
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
    </div>
    <sc-property :property="currentNode" />
  </n-space>
</template>
<script lang="ts" setup>
import { withModifiers } from "vue";
import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
import { get } from "@runafe/platform-share";
import useModel from "../hooks/useModel";
import {
  EyeOutline,
  EyeOffOutline,
  ArrowUp,
  TrashOutline,
} from "@vicons/ionicons5";
const { changeNameByHash, moveNodeGroupByName, addGroup, exportFunc } =
  useModel();
const props = withDefaults(
  defineProps<{
    treeData: THREE.Group[];
    outlinePass: any;
  }>(),
  { treeData: () => [], outlinePass: () => {} }
);
const emit = defineEmits(["select"]);
const treeRef = ref<InstanceType<typeof ElTree>>();
const defaultExpandedKeys = ref<number[]>([]);
let treeDataIn = toRef(props, "treeData");
let treeDataOrigin = [] as THREE.Group[];
const currentNode = ref<TreeNodeData[]>([]);
const filterType = ref("1");
const pattern = ref("");

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
  traverseVisible(data);
};

const traverseVisible = (data: TreeNodeData) => {
  data.visible = !data.visible;
  if (data.children) {
    data.children.forEach((item: TreeNodeData) => {
      traverseVisible(item);
    });
  }
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
      id: data.id,
    },
    h("span", { innerHTML: createLabel(data) }),
    h("div", { class: "flex-row-46" }, [
      data.name === "Scene"
        ? null
        : [
            h(
              ElIcon,
              {
                class: "mr-10px",
                color: "#4194fc",
                onClick: withModifiers(
                  () => moveTop(data),
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
                class: "mr-10px",
                color: "#4194fc",
                onClick: withModifiers(
                  () => deleteNode(data),
                  ["stop", "prevent"]
                ),
              },
              {
                default: () => h(TrashOutline),
              }
            ),
          ],
      h(
        ElIcon,
        {
          class: "mr-20px",
          color: "#4194fc",
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

const deleteNode = (data: TreeNodeData) => {
  treeRef.value?.remove(data.id);
};

const filterNode = (pattern: string, node: TreeNodeData) => {
  if (!pattern) return true;
  const n_name = node.name as string;
  const m_name = node.material?.name as string;
  switch (filterType.value) {
    case "1":
      return n_name.includes(pattern);
    case "2":
      if (!m_name) return false;
      return m_name.includes(pattern);
    default:
      return n_name.includes(pattern);
  }
};

const selectChange = () => {
  pattern.value = "";
};

const changeByHash = () => {
  changeNameByHash(hash.value, treeDataIn.value[0]);
};

const resetTree = () => {
  console.log("reset");
  treeDataIn.value = treeDataOrigin;
};

const handleNodeClick = (data: TreeNodeData) => {
  currentNode.value = [data];
  console.log("select", data);
  emit("select", data);
};

const setCheckedNodes = (node: TreeNodeData) => {
  currentNode.value = [node];
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

// 置顶
const moveTop = (data: any) => {
  treeRef.value?.remove(data.id);
  treeDataIn.value[0].children.unshift(data);
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

defineExpose({
  treeRef,
  setCheckedNodes,
});
</script>
<style scoped>
.el-scrollbar__wrap {
  overflow-x: auto;
}
</style>
