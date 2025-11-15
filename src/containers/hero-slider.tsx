import { useGetSliders } from "@framework/api/slider/get";
import { Carousel, Spin } from "antd";

function HeroSlider() {
  const { data, isLoading, isError } = useGetSliders();
  
  // Показываем загрузку только если данные еще не загружены и нет ошибки
  if (isLoading && !data) {
    return (
      <div className="h-[160px] w-full flex items-center justify-center bg-[var(--tg-theme-secondary-bg-color)] rounded-lg">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return null;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const imageBaseUrl = apiUrl ? `${apiUrl}/` : '/';

  return (
    <Carousel rootClassName="rounded-lg overflow-hidden" autoplay>
      {data.map((item, idx) => (
        <div key={idx} className="h-[160px] w-full">
          <a href={item.url || '#'}>
            <img
              src={`${imageBaseUrl}${item.photo_Path}`}
              alt="slider"
              className="w-full h-full object-cover"
              style={{ 
                display: 'block',
                maxWidth: '100%',
                height: 'auto'
              }}
              loading="lazy"
              onError={(e) => {
                // Обработка ошибок загрузки изображений
                if (import.meta.env.DEV) {
                  console.warn('Failed to load slider image:', item.photo_Path);
                }
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
        </div>
      ))}
    </Carousel>
  );
}

export default HeroSlider;
