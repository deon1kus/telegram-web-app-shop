import "@style/index.css";

import { createRoot } from "react-dom/client";

import App from "./App";
import { TelegramType } from "./types";
import { checkEnvironment } from "./utils/check-env";

declare global {
  interface Window {
    Telegram: TelegramType;
  }
}

// Проверка окружения
checkEnvironment();

// Проверка что root элемент существует
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure <div id='root'></div> exists in index.html");
}

// Обработка ошибок при рендеринге
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h2 style="color: #ff4d4f;">Ошибка загрузки приложения</h2>
      <p>Пожалуйста, обновите страницу или проверьте консоль браузера (F12)</p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">
        ${error instanceof Error ? error.message : "Unknown error"}
      </p>
      <button 
        onclick="window.location.reload()" 
        style="margin-top: 20px; padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Обновить страницу
      </button>
    </div>
  `;
}
