import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

function AppHeader() {
  return (
    <div className="flex w-full items-center justify-between rounded-lg ">
      <Link
        className="flex items-center gap-2 rounded-lg bg-gray-200 p-3"
        style={{ backgroundColor: '#e5e5e5' }}
        to="/cart">
        <ShoppingCartOutlined style={{ fontSize: "22px" }} />
        <span>Моя корзина</span>
      </Link>
      <Link
        className="flex items-center gap-2 rounded-lg bg-gray-200 p-3"
        style={{ backgroundColor: '#e5e5e5' }}
        to="/profile/home">
        <span>Аккаунт</span>
        <UserOutlined style={{ fontSize: "22px" }} />
      </Link>
    </div>
  );
}

export default AppHeader;
