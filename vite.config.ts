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
        // ВАЖНО: Упрощенное разделение для предотвращения ошибки useState
        manualChunks: (id) => {
          // Разделяем node_modules на отдельные чанки
          if (id.includes('node_modules')) {
            // React и React DOM должны быть вместе и загружаться первыми
            // ВАЖНО: Все React зависимости в одном чанке
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
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
            // ВАЖНО: Исключаем из vendor ВСЕ что может использовать React
            // Это критично для предотвращения ошибки "Cannot read properties of undefined (reading 'useState')"
            // Проверяем что это точно не React зависимость
            const isReactRelated = id.includes('react') || 
                                 id.includes('scheduler') || 
                                 id.includes('jsx-runtime') ||
                                 id.includes('react/jsx') ||
                                 id.includes('@vkruglikov') ||
                                 id.includes('react-telegram') ||
                                 id.includes('react-images') ||
                                 id.includes('formik') ||
                                 id.includes('jotai');
            
            // Только чистые библиотеки без React зависимостей идут в vendor
            // Это: axios, dayjs, query-string, clsx, @persian-tools и т.д.
            if (!isReactRelated) {
              return 'vendor';
            }
            // Все остальное (с React зависимостями) идет в основной бандл (index)
            // чтобы гарантировать правильный порядок загрузки
            // Это включает: formik, jotai, react-images-uploading, @vkruglikov/react-telegram-web-app
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
