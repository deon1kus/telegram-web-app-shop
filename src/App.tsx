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
        retry: 1, // Одна попытка повтора
        retryDelay: 1000, // Задержка 1 секунда
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000, // Время кеширования
        // Таймаут для запросов
        networkMode: 'online'
      }
    }
  });

  useEffect(() => {
    // Быстрая инициализация - не ждем Telegram
    let initTimer: NodeJS.Timeout;
    
    try {
      // Пытаемся инициализировать Telegram WebApp
      if (tgApp) {
        try {
          tgApp.ready();
          tgApp.expand();
          // Устанавливаем цветовую схему для светлой темы
          if (tgApp.setHeaderColor) {
            tgApp.setHeaderColor('#ffffff');
          }
          if (tgApp.setBackgroundColor) {
            tgApp.setBackgroundColor('#ffffff');
          }
        } catch (error) {
          // Ошибка инициализации Telegram не критична
          console.warn('Telegram WebApp initialization error:', error);
        }
      }
      
      // Устанавливаем таймер для показа приложения
      initTimer = setTimeout(() => {
        setIsReady(true);
      }, 150);
    } catch (error) {
      // Критическая ошибка - показываем приложение все равно
      console.error('App initialization error:', error);
      setIsReady(true);
    }

    return () => {
      if (initTimer) {
        clearTimeout(initTimer);
      }
    };
  }, [tgApp]);

  if (!isReady) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#000000",
        fontFamily: "Inter, Roboto, system-ui, sans-serif"
      }}>
        <div>
          <div style={{ 
            marginBottom: "10px",
            fontSize: "18px",
            fontWeight: "600",
            color: "#000000"
          }}>
            Загрузка...
          </div>
          <div style={{ 
            fontSize: "12px", 
            color: "#666666",
            marginTop: "10px"
          }}>
            Если загрузка не завершается, проверьте консоль браузера
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
