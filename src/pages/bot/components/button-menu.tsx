/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-wrap-multilines */
import { UnorderedListOutlined, UserOutlined, MessageOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

function UserProfileButtonMenu() {
  const location = useLocation();
  
  return (
    <div
      style={{ boxShadow: "0 0 10px -6px" }}
      className=" mx-auto flex h-16 w-full max-w-[450px] justify-between rounded-t-lg border-b-2 border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-bg-color)] p-2 shadow-lg ">
      <Link
        to="/bot"
        className={`flex w-1/3 flex-col items-center justify-center gap-1 ${location.pathname === '/bot' ? 'text-[var(--tg-theme-button-color)]' : ''}`}>
        <UserOutlined /> Настройки
      </Link>
      <Link
        to="/bot/masters"
        className={`flex w-1/3 flex-col items-center justify-center gap-1 ${location.pathname.startsWith('/bot/masters') ? 'text-[var(--tg-theme-button-color)]' : ''}`}>
        <UnorderedListOutlined /> Мастера
      </Link>
      <Link
        to="/bot/channel"
        className={`flex w-1/3 flex-col items-center justify-center gap-1 ${location.pathname === '/bot/channel' ? 'text-[var(--tg-theme-button-color)]' : ''}`}>
        <MessageOutlined /> Канал
      </Link>
    </div>
  );
}

export default UserProfileButtonMenu;
