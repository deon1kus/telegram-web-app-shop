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
        // Разделение vendor и app кода для лучшей загрузки
        manualChunks: (id) => {
          // Разделяем node_modules на отдельные чанки
          if (id.includes('node_modules')) {
            // React и React DOM должны быть вместе и загружаться первыми
            // ВАЖНО: React должен быть в одном чанке с react-dom
            if (id.includes('react/') || id.includes('react-dom/') || 
                id.includes('/react') || id.includes('/react-dom')) {
              return 'react-vendor';
            }
            // React Router отдельно, но после React
            if (id.includes('react-router')) {
              return 'react-router-vendor';
            }
            // React Query отдельно
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Ant Design отдельно
            if (id.includes('antd')) {
              return 'antd-vendor';
            }
            // Остальные node_modules в отдельный чанк
            // НО только если это не React зависимости
            if (!id.includes('react') && !id.includes('scheduler')) {
              return 'vendor';
            }
          }
        },
        // Оптимизация имен файлов
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Увеличиваем лимит предупреждений для больших бандлов
    chunkSizeWarningLimit: 1000,
    // Включаем сжатие
    reportCompressedSize: true,
    // Оптимизация для продакшена
    sourcemap: false,
    // Убеждаемся что commonjs правильно обрабатывается
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  // Base path для правильной работы на Netlify
  base: "/"
});
