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

// Проверка окружения (только в dev режиме)
if (import.meta.env.DEV) {
  checkEnvironment();
}

// Проверка что root элемент существует
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure <div id='root'></div> exists in index.html");
}

// Обработка ошибок при рендеринге
if (import.meta.env.DEV) {
  console.log('[main] Starting app render');
}
try {
  const root = createRoot(rootElement);
  if (import.meta.env.DEV) {
    console.log('[main] Root created, rendering App');
  }
  root.render(<App />);
  if (import.meta.env.DEV) {
    console.log('[main] App rendered successfully');
  }
} catch (error) {
  // В production используем только console.error для критических ошибок
  console.error("[main] Failed to render app:", error);
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : '';
  
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h2 style="color: #ff4d4f;">Ошибка загрузки приложения</h2>
      <p>Пожалуйста, обновите страницу или проверьте консоль браузера (F12)</p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">
        ${errorMessage}
      </p>
      ${errorStack ? `<pre style="font-size: 10px; text-align: left; overflow: auto; max-height: 200px;">${errorStack}</pre>` : ''}
      <button 
        onclick="window.location.reload()" 
        style="margin-top: 20px; padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Обновить страницу
      </button>
    </div>
  `;
}
