/* eslint-disable indent */
import "@style/app.scss";
import "antd/dist/reset.css";

import { useEffect, useState } from "react";
import useTelegramUser from "@hooks/useTelegramUser";
import useTelegram from "@hooks/useTelegram";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Main from "./layouts/main";
import Router from "./router";

function App() {
  const [isReady, setIsReady] = useState(false);
  const isTG = useTelegramUser();
  const tgApp = useTelegram();
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        retry: false,
        staleTime: 5 * 60 * 1000
      }
    }
  });

  useEffect(() => {
    if (tgApp) {
      tgApp.ready();
      tgApp.expand();
      setIsReady(true);
    } else {
      // Если не в Telegram, все равно показываем приложение для разработки
      setIsReady(true);
    }
  }, [tgApp]);

  if (!isReady) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Загрузка...</div>;
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
    <QueryClientProvider client={queryClient}>
      <Main>
        <Router />
      </Main>
    </QueryClientProvider>
  );
}

export default App;
