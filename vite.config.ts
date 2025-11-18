/** @type {import('vite').UserConfig} */

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    open: false,
    port: 3000
  },
  build: {
    // Минимальная конфигурация как в оригинале
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    // Увеличиваем лимит для больших бандлов
    chunkSizeWarningLimit: 1000
  },
  base: "/"
});
