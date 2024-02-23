import type { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
import type Node from 'element-plus/es/components/tree/src/model/node'
function setCheckedNodes(
  tree: InstanceType<typeof ElTree>,
  data: Node
) {
  if (data) tree.setCurrentNode(data);
  const cur = document.getElementById(data.id.toString()); // 通过Id获取到对应的dom元素
  console.log(cur);
  setTimeout(() => {
    if (cur) {
      nextTick(() => {
        cur.scrollIntoView({ block: "center" }); // 通过scrollIntoView方法将对应的dom元素定位到可见区域 【block: 'center'】这个属性是在垂直方向居中显示
      });
    }
  });
}
export default function useTree() {
  return {
    setCheckedNodes,
  };
}
