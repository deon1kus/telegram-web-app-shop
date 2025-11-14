/**
 * Безопасное получение полного URL изображения
 * @param imagePath - путь к изображению (относительный или абсолютный)
 * @returns полный URL изображения или пустая строка
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '';
  }

  // Если путь уже является полным URL, возвращаем его
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Получаем базовый URL API из переменных окружения
  const apiUrl = import.meta.env.VITE_API_URL;

  // Если API URL не указан, возвращаем относительный путь
  if (!apiUrl) {
    console.warn('VITE_API_URL не указан в переменных окружения. Используется относительный путь для изображений.');
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }

  // Убираем слэш в конце API URL, если есть
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  // Убираем слэш в начале пути изображения, если есть
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  return `${baseUrl}/${cleanPath}`;
};

