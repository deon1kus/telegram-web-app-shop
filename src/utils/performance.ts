/**
 * Утилиты для мониторинга производительности
 * Помогают отслеживать метрики загрузки и производительности
 */

/**
 * Измеряет время выполнения функции
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  if (import.meta.env.DEV && typeof performance !== 'undefined' && performance.mark) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-measure`;

    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    if (measure) {
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    }

    // Очищаем метки
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);

    return result;
  }

  return fn();
}

/**
 * Асинхронная версия measurePerformance
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (import.meta.env.DEV && typeof performance !== 'undefined' && performance.mark) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    const measureName = `${name}-measure`;

    performance.mark(startMark);
    const result = await fn();
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    if (measure) {
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
    }

    // Очищаем метки
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);

    return result;
  }

  return fn();
}

/**
 * Логирует метрики загрузки страницы
 */
export function logPageLoadMetrics(): void {
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;

        console.log('[Performance Metrics]', {
          'Page Load Time': `${pageLoadTime}ms`,
          'DOM Ready Time': `${domReadyTime}ms`,
          'Connect Time': `${connectTime}ms`
        });
      }, 0);
    });
  }
}

/**
 * Дебаунс функция для оптимизации частых вызовов
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Троттлинг функция для ограничения частоты вызовов
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

