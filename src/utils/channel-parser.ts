/**
 * Утилита для парсинга постов из Telegram канала
 * Извлекает информацию о товаре: название, цену, описание, фото, контакты
 */

import { logDebug, logError, logInfo, logWarn } from "./logger";
import type { ParsedProductFromChannel, TelegramChannelPost } from "@framework/types";

interface ParseOptions {
  price_patterns?: RegExp[];
  contact_patterns?: RegExp[];
  category_keywords?: Record<string, number[]>;
}

/**
 * Парсинг поста из канала и извлечение данных товара
 */
export const parseChannelPost = (
  post: TelegramChannelPost,
  options: ParseOptions = {}
): ParsedProductFromChannel | null => {
  try {
    logInfo('ChannelParser', 'Starting post parsing', { message_id: post.message_id });

    const text = post.text || post.caption || '';
    if (!text.trim()) {
      logWarn('ChannelParser', 'Post has no text content', { message_id: post.message_id });
      return null;
    }

    // Извлекаем название товара (обычно первая строка или до цены)
    const productName = extractProductName(text);
    logDebug('ChannelParser', 'Extracted product name', { product_name: productName });

    // Извлекаем описание
    const description = extractDescription(text, productName);
    logDebug('ChannelParser', 'Extracted description', { description_length: description.length });

    // Извлекаем цену
    const price = extractPrice(text, options.price_patterns);
    logDebug('ChannelParser', 'Extracted price', { price });

    // Извлекаем количество (если указано)
    const quantity = extractQuantity(text) || 1;

    // Извлекаем контакты
    const contactInfo = extractContactInfo(text, post, options.contact_patterns);
    logDebug('ChannelParser', 'Extracted contact info', { contactInfo });

    // Извлекаем категории по ключевым словам
    const categoryIds = extractCategories(text, options.category_keywords);
    logDebug('ChannelParser', 'Extracted categories', { categoryIds });

    // Получаем фото
    const photos = extractPhotos(post);

    if (!productName || !price) {
      logWarn('ChannelParser', 'Missing required fields', { 
        has_name: !!productName, 
        has_price: !!price 
      });
      return null;
    }

    const parsed: ParsedProductFromChannel = {
      product_name: productName,
      description: description || productName,
      price,
      quantity,
      photos,
      contact_info: contactInfo,
      category_ids: categoryIds,
      channel_message_id: post.message_id,
      channel_id: post.channel_id,
      parsed_at: new Date().toISOString(),
      raw_text: text
    };

    logInfo('ChannelParser', 'Post parsed successfully', { 
      message_id: post.message_id,
      product_name: productName,
      price 
    });

    return parsed;
  } catch (error) {
    logError('ChannelParser', 'Failed to parse post', error instanceof Error ? error : undefined, { 
      message_id: post.message_id 
    });
    return null;
  }
};

/**
 * Извлечение названия товара
 */
function extractProductName(text: string): string {
  // Убираем лишние пробелы и переносы строк
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Название обычно в первой строке или до символов цены
  const firstLine = lines[0] || '';
  
  // Убираем эмодзи и специальные символы в начале
  const cleaned = firstLine.replace(/^[🔹🔸📦🛍️💎⭐🌟✨🎁🎯🏷️💵💰]/g, '').trim();
  
  // Ограничиваем длину
  return cleaned.substring(0, 200) || 'Товар без названия';
}

/**
 * Извлечение описания
 */
function extractDescription(text: string, productName: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Пропускаем первую строку (название) и строки с ценой/контактами
  const descriptionLines = lines
    .slice(1)
    .filter(line => {
      // Пропускаем строки с ценой
      if (/\d+\s*(руб|тг|сом|тенге|₽|₸|$|USD|EUR)/i.test(line)) return false;
      // Пропускаем строки с контактами
      if (/\+?\d[\d\s\-\(\)]{7,}/.test(line)) return false;
      if (/@\w+/.test(line)) return false;
      if (/https?:\/\//.test(line)) return false;
      return true;
    });
  
  return descriptionLines.join('\n').substring(0, 2000) || productName;
}

/**
 * Извлечение цены
 */
function extractPrice(text: string, customPatterns?: RegExp[]): number {
  // Стандартные паттерны для цены
  const defaultPatterns = [
    /(\d+[\s,.]?\d*)\s*(руб|₽|RUB)/i,
    /(\d+[\s,.]?\d*)\s*(тг|₸|тенге|KZT)/i,
    /(\d+[\s,.]?\d*)\s*(сом|KGS)/i,
    /(\d+[\s,.]?\d*)\s*(USD|\$)/i,
    /(\d+[\s,.]?\d*)\s*(EUR|€)/i,
    /цена[:\s]+(\d+[\s,.]?\d*)/i,
    /стоимость[:\s]+(\d+[\s,.]?\d*)/i,
    /(\d+[\s,.]?\d*)\s*(р\.|руб\.)/i
  ];

  const patterns = customPatterns || defaultPatterns;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/[\s,]/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        return Math.round(price);
      }
    }
  }

  // Если не нашли, ищем просто числа
  const numberMatch = text.match(/\b(\d{3,})\b/);
  if (numberMatch) {
    const price = parseFloat(numberMatch[1]);
    if (!isNaN(price) && price > 100) { // Минимальная цена 100
      return Math.round(price);
    }
  }

  return 0;
}

/**
 * Извлечение количества
 */
function extractQuantity(text: string): number | null {
  const patterns = [
    /количество[:\s]+(\d+)/i,
    /кол-во[:\s]+(\d+)/i,
    /в наличии[:\s]+(\d+)/i,
    /(\d+)\s*шт/i,
    /(\d+)\s*штук/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const quantity = parseInt(match[1], 10);
      if (!isNaN(quantity) && quantity > 0) {
        return quantity;
      }
    }
  }

  return null;
}

/**
 * Извлечение контактной информации
 */
function extractContactInfo(
  text: string,
  post: TelegramChannelPost,
  customPatterns?: RegExp[]
): { phone?: string; username?: string; email?: string } {
  const contactInfo: { phone?: string; username?: string; email?: string } = {};

  // Телефон
  const phonePatterns = customPatterns || [
    /\+?\d[\d\s\-\(\)]{7,}/g,
    /(\+?\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9})/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      contactInfo.phone = matches[0].replace(/[\s\-\(\)]/g, '');
      break;
    }
  }

  // Username
  const usernameMatch = text.match(/@(\w+)/);
  if (usernameMatch) {
    contactInfo.username = usernameMatch[1];
  }

  // Email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    contactInfo.email = emailMatch[1];
  }

  return contactInfo;
}

/**
 * Извлечение категорий по ключевым словам
 */
function extractCategories(
  text: string,
  categoryKeywords?: Record<string, number[]>
): number[] {
  if (!categoryKeywords) return [];

  const lowerText = text.toLowerCase();
  const foundCategories: number[] = [];

  for (const [keyword, categoryIds] of Object.entries(categoryKeywords)) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundCategories.push(...categoryIds);
    }
  }

  return [...new Set(foundCategories)]; // Убираем дубликаты
}

/**
 * Извлечение фото из поста
 */
function extractPhotos(post: TelegramChannelPost): string[] {
  const photos: string[] = [];

  if (post.photos && post.photos.length > 0) {
    // Берем самое большое фото (обычно последнее)
    const largestPhoto = post.photos.reduce((prev, current) => 
      (current.width * current.height) > (prev.width * prev.height) ? current : prev
    );
    
    // В реальной реализации нужно будет получить file_path через Telegram Bot API
    // Здесь возвращаем file_id как временное решение
    photos.push(largestPhoto.file_id);
  }

  return photos;
}

/**
 * Валидация распарсенного товара
 */
export const validateParsedProduct = (product: ParsedProductFromChannel): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!product.product_name || product.product_name.trim().length < 3) {
    errors.push('Название товара слишком короткое');
  }

  if (product.price <= 0) {
    errors.push('Цена должна быть больше 0');
  }

  if (product.quantity <= 0) {
    errors.push('Количество должно быть больше 0');
  }

  if (!product.description || product.description.trim().length < 10) {
    errors.push('Описание слишком короткое');
  }

  if (product.photos.length === 0) {
    errors.push('Товар должен иметь хотя бы одно фото');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

