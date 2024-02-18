<template>
  <!-- 根据props数据数组显示数据 name value形式 -->
  <div v-for="item in propertyData">
    <div class="flex-row-4"><span class="mr-10px">name</span><el-input v-model="item.name" class="w-200px" /></div>
  </div>
</template>
<script setup lang="ts">
// props 数据 property 默认数组
import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
const props = defineProps({
  property: {
    type: Array as PropType<TreeNodeData[]>,
    default: () => [],
  },
});

const propertyData = toRef(props, "property");
</script>
