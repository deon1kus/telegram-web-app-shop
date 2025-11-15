/* eslint-disable camelcase */
/* eslint-disable indent */
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";
import { ConfigProvider, theme } from "antd";
import ru_RU from "antd/locale/ru_RU";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function Main({ children }: Props) {
  const [colorScheme, themeParams] = useThemeParams();
  // const { id } = useTelegramUser();
  // const { data } = useGetUserInfo({ user_Id: id });
  const customizeRenderEmpty = () => (
    <div style={{ textAlign: "center" }}>
      <p>Информация недоступна</p>
    </div>
  );
  return (
    <div 
      className="app w-full"
      style={{
        minHeight: 'var(--tg-viewport-stable-height, 100vh)',
        height: 'var(--tg-viewport-stable-height, 100vh)',
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
      <div className="w-full mx-auto" style={{ maxWidth: '450px', width: '100%' }}>
        <ConfigProvider
          direction="ltr"
          locale={ru_RU}
          renderEmpty={customizeRenderEmpty}
          theme={
            themeParams.text_color
              ? {
                  algorithm:
                    colorScheme === "dark"
                      ? theme.darkAlgorithm
                      : theme.defaultAlgorithm,
                  token: {
                    colorText: themeParams.text_color,
                    colorPrimary: themeParams.button_color,
                    colorBgBase: themeParams.bg_color
                  }
                }
              : undefined
          }>
          {/* <header className="App-header">
              <img src="/vite.svg" className="App-logo" alt="logo" />
            </header> */}
          <div className="contentWrapper">{children}</div>
        </ConfigProvider>
      </div>
    </div>
  );
}

export default Main;
