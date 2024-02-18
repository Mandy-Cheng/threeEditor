import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
// import ElementPlus from "element-plus";
// import naive from "naive-ui";
import "element-plus/dist/index.css";
import "uno.css";
import directives from "./directives/index.ts";

createApp(App).use(directives).mount("#app");
