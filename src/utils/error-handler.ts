/**
 * Централизованная обработка ошибок
 * Помогает обрабатывать различные типы ошибок единообразно
 */

import { message } from 'antd';
import { logError } from './logger';

export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

/**
 * Обрабатывает ошибки API запросов
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Произошла ошибка при выполнении запроса'
): void {
  const apiError = error as ApiError;
  
  // Логируем ошибку
  logError('API', defaultMessage, apiError instanceof Error ? apiError : undefined);

  // Определяем сообщение для пользователя
  let userMessage = defaultMessage;

  if (apiError?.response?.data?.message) {
    userMessage = apiError.response.data.message;
  } else if (apiError?.response?.data?.error) {
    userMessage = apiError.response.data.error;
  } else if (apiError?.message) {
    userMessage = apiError.message;
  }

  // Специальная обработка для разных статусов
  if (apiError?.response?.status) {
    switch (apiError.response.status) {
      case 400:
        userMessage = 'Неверный запрос. Проверьте введенные данные.';
        break;
      case 401:
        userMessage = 'Требуется авторизация. Пожалуйста, войдите в систему.';
        break;
      case 403:
        userMessage = 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
        break;
      case 404:
        userMessage = 'Ресурс не найден.';
        break;
      case 408:
        userMessage = 'Превышено время ожидания. Попробуйте еще раз.';
        break;
      case 429:
        userMessage = 'Слишком много запросов. Пожалуйста, подождите немного.';
        break;
      case 500:
        userMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
        break;
      case 503:
        userMessage = 'Сервис временно недоступен. Пожалуйста, попробуйте позже.';
        break;
      default:
        // Используем userMessage из ответа или defaultMessage
        break;
    }
  }

  // Показываем сообщение пользователю
  message.error(userMessage);
}

/**
 * Проверяет, является ли ошибка сетевой ошибкой
 */
export function isNetworkError(error: unknown): boolean {
  const apiError = error as ApiError;
  return !apiError?.response && apiError?.message?.includes('Network');
}

/**
 * Проверяет, является ли ошибка ошибкой таймаута
 */
export function isTimeoutError(error: unknown): boolean {
  const apiError = error as ApiError;
  return apiError?.response?.status === 408 || 
         apiError?.message?.toLowerCase().includes('timeout');
}

/**
 * Получает понятное сообщение об ошибке для пользователя
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Проблема с подключением к интернету. Проверьте соединение.';
  }
  
  if (isTimeoutError(error)) {
    return 'Превышено время ожидания ответа. Попробуйте еще раз.';
  }

  const apiError = error as ApiError;
  if (apiError?.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (apiError?.message) {
    return apiError.message;
  }

  return 'Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз.';
}

