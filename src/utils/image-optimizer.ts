/**
 * Утилиты для оптимизации изображений
 * Помогает загружать и отображать изображения оптимальным образом
 */

/**
 * Генерирует srcset для responsive изображений
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[]
): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
}

/**
 * Определяет оптимальный размер изображения на основе viewport
 */
export function getOptimalImageSize(
  containerWidth: number,
  devicePixelRatio: number = 1
): number {
  // Умножаем на DPR для retina дисплеев
  const targetWidth = containerWidth * devicePixelRatio;
  
  // Округляем до ближайшего стандартного размера
  const sizes = [320, 640, 960, 1280, 1920, 2560];
  return sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];
}

/**
 * Lazy loading для изображений
 */
export function createLazyImageProps(
  src: string,
  alt: string,
  width?: number,
  height?: number
): {
  src: string;
  alt: string;
  loading: 'lazy';
  width?: number;
  height?: number;
  decoding: 'async';
} {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height })
  };
}

/**
 * Проверяет поддержку WebP формата
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Возвращает оптимальный формат изображения
 */
export async function getOptimalImageFormat(
  baseUrl: string
): Promise<string> {
  const supports = await supportsWebP();
  if (supports) {
    return baseUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return baseUrl;
}

/**
 * Предзагрузка изображения
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

