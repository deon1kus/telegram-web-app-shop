/**
 * Хук для throttle значений
 * Ограничивает частоту обновления значения
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Троттлинг значение с ограничением частоты
 * 
 * @param value - Значение для троттлинга
 * @param limit - Минимальный интервал между обновлениями в миллисекундах
 * @returns Троттлированное значение
 * 
 * @example
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 * 
 * useEffect(() => {
 *   // Выполняется максимум раз в 100ms
 *   updateHeaderPosition(throttledScrollY);
 * }, [throttledScrollY]);
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

