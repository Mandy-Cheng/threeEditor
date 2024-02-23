import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "element-plus/dist/index.css";
import "uno.css";
import directives from "./directives/index.ts";
import router from "./router/index.ts";

createApp(App).use(router).use(directives).mount("#app");
