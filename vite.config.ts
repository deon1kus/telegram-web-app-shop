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
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Упрощенная стратегия для предотвращения ошибки useState
        // Все React-зависимости остаются в основном бандле (index.js)
        // Только чистые библиотеки БЕЗ React идут в vendor
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Проверяем, является ли библиотека React-зависимой
            // ВСЕ React-зависимые библиотеки остаются в основном бандле
            const isReactRelated = 
              id.includes('react') ||
              id.includes('scheduler') ||
              id.includes('jsx-runtime') ||
              id.includes('react-router') ||
              id.includes('react-query') ||
              id.includes('@tanstack/react-query') ||
              id.includes('antd') ||
              id.includes('@vkruglikov') ||
              id.includes('react-telegram') ||
              id.includes('react-images') ||
              id.includes('formik') ||
              id.includes('jotai');
            
            // Только чистые библиотеки БЕЗ React идут в vendor
            // Это: axios, dayjs, query-string, clsx, @persian-tools и т.д.
            if (!isReactRelated) {
              return 'vendor';
            }
            
            // ВСЕ React-зависимые библиотеки остаются в основном бандле (index.js)
            // Это гарантирует правильный порядок загрузки и предотвращает ошибку useState
            return undefined; // undefined означает, что модуль идет в основной бандл
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
