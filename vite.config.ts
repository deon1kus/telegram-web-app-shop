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
    minify: "terser",
    // Убеждаемся, что пути правильные для деплоя
    assetsDir: "assets",
    outDir: "dist",
    // Оптимизация сборки
    rollupOptions: {
      output: {
        // Разделение vendor и app кода
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    },
    // Увеличиваем лимит предупреждений для больших бандлов
    chunkSizeWarningLimit: 1000
  },
  // Base path для правильной работы на Netlify
  base: "/"
});
