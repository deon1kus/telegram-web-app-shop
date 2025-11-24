/* eslint-disable indent */
import "@style/app.scss";
import "antd/dist/reset.css";

import { useEffect, useState } from "react";
import useTelegramUser from "@hooks/useTelegramUser";
import useTelegram from "@hooks/useTelegram";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Main from "./layouts/main";
import Router from "./router";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [isReady, setIsReady] = useState(false);
  const isTG = useTelegramUser();
  const tgApp = useTelegram();
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Отключаем для производительности
        refetchOnMount: true,
        refetchOnReconnect: false, // Отключаем для производительности
        retry: (failureCount, error: any) => {
          // Не повторяем запросы для 4xx ошибок (кроме 408, 429)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            if (error?.response?.status === 408 || error?.response?.status === 429) {
              return failureCount < 2; // Повторяем только для timeout и rate limit
            }
            return false; // Не повторяем для других 4xx
          }
          return failureCount < 2; // Повторяем до 2 раз для других ошибок
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
        gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кеше
        networkMode: 'online',
        // Таймаут для запросов (30 секунд)
        meta: {
          timeout: 30000
        }
      },
      mutations: {
        retry: 1, // Одна попытка повтора для мутаций
        retryDelay: 1000
      }
    }
  });

  useEffect(() => {
    // Проверяем наличие Telegram WebApp
    const checkTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        return window.Telegram.WebApp;
      }
      return null;
    };

    // Быстрая инициализация - не ждем Telegram
    const initTimer = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.log('[App] Setting isReady to true');
      }
      setIsReady(true);
    }, 100);

    const webApp = checkTelegram();
    if (webApp) {
      try {
        if (import.meta.env.DEV) {
          console.log('[App] Initializing Telegram WebApp');
        }
        webApp.ready();
        webApp.expand();
        if (import.meta.env.DEV) {
          console.log('[App] Telegram WebApp initialized');
        }
      } catch (error) {
        // Критические ошибки всегда логируем
        console.error('[App] Telegram WebApp initialization error:', error);
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('[App] Telegram WebApp not found, running in browser mode');
      }
    }

    return () => clearTimeout(initTimer);
  }, [tgApp]);

  if (!isReady) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>
          <div style={{ marginBottom: "10px" }}>Загрузка...</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Если загрузка не завершается, проверьте консоль браузера (F12)
          </div>
        </div>
      </div>
    );
  }

  // Для разработки и тестирования разрешаем работу вне Telegram
  // В продакшене можно вернуть проверку
  // if (!isTG && !tgApp) {
  //   return (
  //     <div style={{ padding: "20px", textAlign: "center" }}>
  //       Пожалуйста, откройте приложение в Telegram
  //     </div>
  //   );
  // }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Main>
          <Router />
        </Main>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
