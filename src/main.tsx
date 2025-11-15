import "@style/index.css";

import { createRoot } from "react-dom/client";

import App from "./App";
import { TelegramType } from "./types";
import { checkEnvironment } from "./utils/check-env";
import { checkAppLoad, checkResources, debugLog } from "./utils/debug";

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
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #00ff88;
    ">
      <h2 style="color: #ff0080; text-shadow: 0 0 10px rgba(255, 0, 128, 0.5); margin-bottom: 20px;">
        Ошибка загрузки приложения
      </h2>
      <p style="color: #8b8b9e; margin-bottom: 10px;">
        Пожалуйста, обновите страницу или проверьте консоль браузера
      </p>
      <p style="font-size: 12px; color: #8b8b9e; margin-top: 10px; max-width: 80%; word-break: break-word;">
        ${errorMessage}
      </p>
      ${errorStack ? `<p style="font-size: 10px; color: #666; margin-top: 5px; max-width: 90%; word-break: break-word; font-family: monospace;">${errorStack.substring(0, 200)}...</p>` : ''}
      <button 
        onclick="window.location.reload()" 
        style="
          margin-top: 20px; 
          padding: 12px 24px; 
          background: linear-gradient(135deg, #ff0080 0%, #ff0066 100%); 
          color: white; 
          border: 1px solid #ff0080;
          border-radius: 8px; 
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.4);
          transition: all 0.3s ease;
        "
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 30px rgba(255, 0, 128, 0.6)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 20px rgba(255, 0, 128, 0.4)';">
        Обновить страницу
      </button>
    </div>
  `;
}
