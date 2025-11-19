/**
 * Утилиты для отправки уведомлений в Telegram канал
 * 
 * Функционал:
 * 1. Генерация последовательных ID для товаров
 * 2. Отправка уведомлений в канал уведомлений
 * 3. Форматирование ссылок на сообщения
 */

// Конфигурация каналов
export const CHANNELS = {
  PRODUCTS: {
    CHAT_ID: '-1003271699368',
    USERNAME: null // Можно добавить если есть публичный username
  },
  NOTIFICATIONS: {
    CHAT_ID: '-1003271699368', // Канал уведомлений (тот же, где товары)
    LINK: 'https://t.me/c/3271699368',
    USERNAME: null
  }
};

/**
 * Генерирует ссылку на сообщение в канале
 * 
 * @param channelChatId - Chat ID канала
 * @param messageId - ID сообщения
 * @returns Ссылка на сообщение
 */
export function generateMessageLink(channelChatId: string, messageId: number): string {
  // Формат ссылки: https://t.me/c/{chat_id}/{message_id}
  // Убираем "-100" из начала chat_id для ссылки
  const chatIdForLink = channelChatId.replace(/^-100/, '');
  return `https://t.me/c/${chatIdForLink}/${messageId}`;
}

/**
 * Форматирует уведомление о новом товаре
 * 
 * @param productName - Название товара
 * @param productId - ID товара (последовательный номер)
 * @param messageLink - Ссылка на сообщение в канале
 * @returns Отформатированный текст уведомления
 */
export function formatProductNotification(
  productName: string,
  productId: number,
  messageLink: string
): string {
  return `🆕 Новый товар #${productId}

📦 ${productName}

🔗 [Открыть в канале](${messageLink})`;
}

/**
 * Форматирует уведомление об обновлении товара
 * 
 * @param productName - Название товара
 * @param productId - ID товара
 * @param messageLink - Ссылка на сообщение в канале
 * @returns Отформатированный текст уведомления
 */
export function formatProductUpdateNotification(
  productName: string,
  productId: number,
  messageLink: string
): string {
  return `✏️ Товар обновлен #${productId}

📦 ${productName}

🔗 [Открыть в канале](${messageLink})`;
}

/**
 * Форматирует уведомление об удалении товара
 * 
 * @param productName - Название товара
 * @param productId - ID товара
 * @returns Отформатированный текст уведомления
 */
export function formatProductDeleteNotification(
  productName: string,
  productId: number
): string {
  return `🗑️ Товар удален #${productId}

📦 ${productName}`;
}

/**
 * Генерирует следующий последовательный ID для товара
 * 
 * В реальной реализации это должно быть на бэкенде:
 * - Хранить последний ID в базе данных
 * - Использовать AUTO_INCREMENT или последовательность
 * 
 * @param lastProductId - Последний использованный ID (из базы данных)
 * @returns Следующий ID
 */
export function generateNextProductId(lastProductId: number = 0): number {
  return lastProductId + 1;
}

/**
 * Извлекает product ID из текста сообщения
 * 
 * @param messageText - Текст сообщения
 * @returns ID товара или null
 */
export function extractProductIdFromMessage(messageText: string): number | null {
  // Ищем паттерн #product_id:123 или #123 в начале сообщения
  const match = messageText.match(/#product_id[:\s]*(\d+)/i) || 
                messageText.match(/^#(\d+)/);
  
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Добавляет product ID в текст сообщения
 * 
 * @param messageText - Исходный текст сообщения
 * @param productId - ID товара
 * @returns Текст с добавленным ID
 */
export function addProductIdToMessage(messageText: string, productId: number): string {
  // Убираем старый product_id если есть
  const cleanedText = messageText.replace(/#product_id[:\s]*\d+/gi, '').trim();
  
  // Добавляем новый ID в конец
  return `${cleanedText}\n\n#product_id:${productId}`;
}

