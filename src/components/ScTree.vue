<template>
  <n-space
    vertical
    class="p-y-20px p-x-10px box-border w-full w-min-300px zIndex-999"
  >
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
  </n-space>
</template>
<script lang="ts" setup>
import { withModifiers } from "vue";
import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
import { get } from "@runafe/platform-share";
import {
  EyeOutline,
  EyeOffOutline,
  ArrowUp,
  TrashOutline,
} from "@vicons/ionicons5";
import emitter from "@/utils/emitter.ts";

const props = withDefaults(
  defineProps<{
    treeData: THREE.Group[];
    outlinePass: any;
  }>(),
  { treeData: () => [], outlinePass: () => {} }
);

const treeRef = ref<InstanceType<typeof ElTree>>();
const defaultExpandedKeys = ref<number[]>([]);
let treeDataIn = toRef(props, "treeData");
const currentNode = ref<TreeNodeData>({});
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
      data.parent === null
        ? null
        : [
            data.parent.name === "Model"
              ? h(
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
                )
              : null,
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

const handleNodeClick = (data: TreeNodeData) => {
  currentNode.value = data;
};

const setCheckedNodes = (node: TreeNodeData) => {
  treeRef.value?.setCurrentKey(node.id.toString());
  currentNode.value = treeRef.value?.getCurrentNode() as TreeNodeData;
  nextTick(() => {
    setTimeout(() => {
      const cur = document.getElementById(node.id.toString());
      console.log(cur);
      if (cur) {
        cur.scrollIntoView({ block: "center" }); // 通过scrollIntoView方法将对应的dom元素定位到可见区域 【block: 'center'】这个属性是在垂直方向居中显示
      }
    }, 500);
  });
};
// 置顶
const moveTop = (data: any) => {
  treeRef.value?.remove(data.id);
  treeDataIn.value[0].children.unshift(data);
};

emitter.on("selectNode", (node: any) => {
  setCheckedNodes(node);
});

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
  currentNode,
});
</script>
<style scoped>
.el-scrollbar__wrap {
  overflow-x: auto;
}
</style>
