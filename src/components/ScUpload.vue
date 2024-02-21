<template>
  <el-upload
    drag
    action="#"
    multiple="false"
    :show-file-list="false"
    :auto-upload="false"
    :on-change="handleChange"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
  >
    <el-button type="primary">Click to upload</el-button>
    <!-- <el-icon class="el-icon--upload"><CloudUploadOutline /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div> -->
  </el-upload>
</template>
<script lang="ts" setup>
import { ref, toRaw, watch } from "vue";
import useIndexedDB from "@/hooks/useIndexDb";
const fileList = ref<any>([]);
const { saveModelToIndexDb } = useIndexedDB();
const emit = defineEmits(["load"]);
function handleSuccess(response: any, file: any, fileList: any) {
  console.log("文件上传成功");
  console.log(response, file, fileList);
}

function handleChange() {
  fileList.value = arguments[1];
  if (fileList.value.length === 0) {
    console.log("没有文件可以上传");
    return;
  }
  saveModelToIndexDb("xsw", toRaw(fileList.value[0])).then(() => {
    console.log("保存成功");
    emit("load");
  });
}

function handleRemove() {
  console.log(arguments);
  fileList.value = arguments[1];
}

watch(fileList, (newVal) => {
  console.log(newVal);
});
</script>
