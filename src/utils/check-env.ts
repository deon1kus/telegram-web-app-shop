/**
 * Проверка окружения и диагностика проблем
 */
export const checkEnvironment = () => {
  const issues: string[] = [];

  // Проверка что мы в браузере
  if (typeof window === 'undefined') {
    issues.push('Window object is undefined - not running in browser');
  }

  // Проверка root элемента
  const root = document.getElementById('root');
  if (!root) {
    issues.push('Root element (#root) not found in DOM');
  }

  // Проверка Telegram WebApp
  if (typeof window !== 'undefined' && !window.Telegram) {
    // Это не ошибка, просто информация
    console.info('Telegram WebApp not detected - running in browser mode');
  }

  // Проверка базового URL
  const baseUrl = window.location.origin;
  console.info('Base URL:', baseUrl);

  if (issues.length > 0) {
    console.warn('Environment issues detected:', issues);
    return false;
  }

  return true;
};

