import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";

function scrollIntoView(el: HTMLElement) {
  el.scrollIntoView({ block: "center" });
}

function setCheckedNodes(
  tree: InstanceType<typeof ElTree>,
  data: TreeNodeData
) {
  tree.setCurrentKey(data.id.toString());
  setTimeout(() => {
    const cur = document.getElementById(data.id.toString()); // 通过Id获取到对应的dom元素
    if (cur) {
      nextTick(() => {
        scrollIntoView(cur); // 通过scrollIntoView方法将对应的dom元素定位到可见区域 【block: 'center'】这个属性是在垂直方向居中显示
      });
    }
  });
}


export default function useTree() {

  return {
    setCheckedNodes,
    scrollIntoView,
  };
}
