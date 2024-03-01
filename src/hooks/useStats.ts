import Stats from "three/examples/jsm/libs/stats.module.js";

function createStatsPanel(){
  const stats = new Stats();
  stats.showPanel(0);
  stats.dom.style.position = "absolute";
  stats.dom.style.top = "0px";
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "100";
  return stats;
};

export default function useStats() {
  return {
    createStatsPanel,
  };
}
