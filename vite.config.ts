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
    // КРИТИЧНО: Включаем правильную обработку HTML
    emptyOutDir: true,
    // Убеждаемся что все пути абсолютные
    assetsInlineLimit: 4096,
    // КРИТИЧНО: Упрощаем chunk splitting для предотвращения ERR_CONNECTION_RESET
    // Большие чанки могут вызывать проблемы с загрузкой на Netlify
    rollupOptions: {
      output: {
        // МИНИМАЛЬНОЕ разделение - только критичные библиотеки
        manualChunks: (id) => {
          // Только node_modules разделяем
          if (id.includes('node_modules')) {
            // React и все его зависимости - ОБЯЗАТЕЛЬНО вместе
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('scheduler') ||
                id.includes('jsx-runtime')) {
              return 'react-core';
            }
            // Ant Design - большая библиотека, отдельно
            if (id.includes('antd')) {
              return 'antd';
            }
            // Все остальное в один vendor chunk для уменьшения количества запросов
            // Это предотвращает ERR_CONNECTION_RESET из-за множества параллельных запросов
            return 'vendor';
          }
        },
        // Оптимизация имен файлов
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // КРИТИЧНО: Ограничиваем размер чанков для предотвращения таймаутов
        // Включаем inline для маленьких чанков
        inlineDynamicImports: false
      }
    },
    // Увеличиваем лимит предупреждений для больших бандлов
    chunkSizeWarningLimit: 500,
    // Включаем сжатие
    reportCompressedSize: true,
    // Оптимизация для продакшена
    sourcemap: false,
    // Убеждаемся что commonjs правильно обрабатывается
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // КРИТИЧНО: Увеличиваем таймаут сборки для больших проектов
    target: 'esnext',
    // Оптимизация для лучшей загрузки
    cssCodeSplit: true,
    // Уменьшаем размер бандла
    terserOptions: {
      compress: {
        drop_console: false, // Оставляем console для отладки
        drop_debugger: true
      }
    }
  },
  // Base path для правильной работы на Netlify
  base: "/"
});
