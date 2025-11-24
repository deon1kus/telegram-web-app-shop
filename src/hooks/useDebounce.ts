/**
 * Хук для debounce значений
 * Полезен для поиска, фильтрации и других операций с задержкой
 */

import { useEffect, useState } from 'react';

/**
 * Дебаунс значение с задержкой
 * 
 * @param value - Значение для дебаунса
 * @param delay - Задержка в миллисекундах
 * @returns Дебаунснутое значение
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Выполняется только после 500ms без изменений searchTerm
 *   searchProducts(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

