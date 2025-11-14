import { Suspense, lazy } from "react";
import Boxes from "@containers/boxes";
import useTelegram from "@hooks/useTelegram";
import { Spin } from "antd";

import AppHeader from "../layouts/header";

// Ленивая загрузка компонентов для улучшения производительности
const HeroSlider = lazy(() => import("@containers/hero-slider"));
const ProductNews = lazy(() => import("@containers/product-news"));

// Компонент загрузки
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <Spin size="large" />
  </div>
);

function Home() {
  const tgApp = useTelegram();

  // const userId = tgApp.initDataUnsafe.user.id;
  // const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <AppHeader />
      <Suspense fallback={<LoadingFallback />}>
        <HeroSlider />
      </Suspense>
      <Boxes />
      <Suspense fallback={<LoadingFallback />}>
        <ProductNews />
      </Suspense>
    </div>
  );
}

export default Home;
