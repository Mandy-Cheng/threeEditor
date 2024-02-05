import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
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
