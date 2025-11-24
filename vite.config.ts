/** @type {import('vite').UserConfig} */

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react({
      // Оптимизация React для production
      jsxRuntime: 'automatic'
    }),
    tsconfigPaths()
  ],
  server: {
    open: false,
    port: 3000
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    // Оптимизация размера бандла
    chunkSizeWarningLimit: 1000,
    // Code splitting для лучшей производительности
    rollupOptions: {
      output: {
        manualChunks: {
          // Выделяем vendor библиотеки в отдельные чанки
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'query-vendor': ['@tanstack/react-query'],
          'telegram-vendor': ['@vkruglikov/react-telegram-web-app', 'react-telegram-webapp']
        },
        // Оптимизация имен файлов для кеширования
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Минификация и оптимизация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удаляем console.log в production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    // Оптимизация CSS
    cssCodeSplit: true,
    // Увеличиваем лимит для предупреждений
    reportCompressedSize: false // Ускоряет сборку
  },
  base: "/",
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'antd',
      '@ant-design/icons'
    ]
  }
});
