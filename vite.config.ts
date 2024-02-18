import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import {
  ElementPlusResolver,
  NaiveUiResolver,
} from "unplugin-vue-components/resolvers";
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      AutoImport({
        dts: './src/auto-imports.d.ts',
        imports: ["vue", "vue-router"],
        resolvers: [ElementPlusResolver(), NaiveUiResolver()],
      }),
      Components({
        dts: './src/components.d.ts',
        resolvers: [ElementPlusResolver(), NaiveUiResolver()],
      }),
      UnoCSS({
        configFile: "./unocss.config.ts",
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
  };
});
