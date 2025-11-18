/**
 * Точка входа приложения Telegram Web App Shop v0.0.2
 * 
 * ВАЖНО: Этот файл критичен для правильной загрузки приложения!
 * 
 * Основные функции:
 * 1. Инициализация React приложения
 * 2. Проверка окружения (только в dev режиме)
 * 3. Обработка ошибок при рендеринге
 * 4. Отладка загрузки ресурсов
 * 
 * История исправлений:
 * - v0.0.1: Первоначальная версия
 * - v0.0.2: Добавлена обработка ошибок, улучшена отладка
 */

import "@style/index.css";

import { createRoot } from "react-dom/client";

import App from "./App";
import { TelegramType } from "./types";
import { checkEnvironment } from "./utils/check-env";
import { checkAppLoad, checkResources, debugLog } from "./utils/debug";

// Расширение глобального объекта Window для поддержки Telegram Web App API
declare global {
  interface Window {
    Telegram: TelegramType;
  }
}

// Проверка окружения (только в dev режиме)
if (import.meta.env.DEV) {
  checkEnvironment();
}

// Отладка загрузки приложения
debugLog('Starting app initialization...');
checkAppLoad();
setTimeout(() => {
  checkResources();
}, 100);

// Проверка что root элемент существует
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure <div id='root'></div> exists in index.html");
}

// Обработка ошибок при рендеринге
try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : "";
  
  rootElement.innerHTML = `
    <div style="
      padding: 20px; 
      text-align: center; 
      font-family: Inter, Roboto, system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      color: #000000;
    ">
      <h2 style="color: #ff4d4f; margin-bottom: 20px;">
        Ошибка загрузки приложения
      </h2>
      <p style="color: #666666; margin-bottom: 10px;">
        Пожалуйста, обновите страницу или проверьте консоль браузера
      </p>
      <p style="font-size: 12px; color: #666666; margin-top: 10px; max-width: 80%; word-break: break-word;">
        ${errorMessage}
      </p>
      ${errorStack ? `<p style="font-size: 10px; color: #999999; margin-top: 5px; max-width: 90%; word-break: break-word; font-family: monospace;">${errorStack.substring(0, 200)}...</p>` : ''}
      <button 
        onclick="window.location.reload()" 
        style="
          margin-top: 20px; 
          padding: 12px 24px; 
          background: #1890ff; 
          color: white; 
          border: 1px solid #1890ff;
          border-radius: 6px; 
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
          transition: all 0.3s ease;
        "
        onmouseover="this.style.background='#40a9ff'; this.style.borderColor='#40a9ff'; this.style.transform='translateY(-1px)';"
        onmouseout="this.style.background='#1890ff'; this.style.borderColor='#1890ff'; this.style.transform='translateY(0)';">
        Обновить страницу
      </button>
    </div>
  `;
}
