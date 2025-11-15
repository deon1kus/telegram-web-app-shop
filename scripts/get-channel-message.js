/**
 * Скрипт для получения сообщения из Telegram канала
 * 
 * Использование:
 * node scripts/get-channel-message.js
 * 
 * Требуется:
 * - TELEGRAM_BOT_TOKEN в переменных окружения или .env
 * - Chat ID канала: -1003271699368
 */

// Используем динамический импорт для совместимости с ES modules
let axios, fs, path;

// Проверяем тип модуля
if (typeof require !== 'undefined') {
  // CommonJS
  axios = require('axios');
  fs = require('fs');
  path = require('path');
} else {
  // ES modules - будет обработан отдельно
  import('axios').then(module => axios = module.default);
  import('fs').then(module => fs = module.default);
  import('path').then(module => path = module.default);
}

// Конфигурация
const CHANNEL_CHAT_ID = '-1003271699368';
const MESSAGE_ID = 6; // Из URL: https://t.me/c/3271699368/6
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Функция для логирования
function log(step, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    step,
    message,
    data: data ? JSON.stringify(data, null, 2) : null
  };
  
  console.log(`[${timestamp}] [${step}] ${message}`);
  if (data) {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
  
  // Сохраняем в файл
  const logFile = path.join(__dirname, 'channel-integration-steps.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n\n');
}

// Функция для получения сообщения из канала
async function getChannelMessage(chatId, messageId) {
  try {
    log('STEP_1', 'Начало получения сообщения из канала', { chatId, messageId });
    
    const response = await axios.get(`${TELEGRAM_API_URL}/getChat`, {
      params: { chat_id: chatId }
    });
    
    log('STEP_2', 'Информация о канале получена', response.data);
    
    // Получаем сообщение
    const messageResponse = await axios.get(`${TELEGRAM_API_URL}/forwardMessage`, {
      params: {
        chat_id: chatId,
        from_chat_id: chatId,
        message_id: messageId
      }
    }).catch(async (error) => {
      // Если forwardMessage не работает, пробуем getUpdates
      log('STEP_3', 'forwardMessage не сработал, пробуем другой метод', error.response?.data);
      
      // Пробуем получить через getUpdates (последние обновления)
      const updatesResponse = await axios.get(`${TELEGRAM_API_URL}/getUpdates`);
      log('STEP_4', 'Получены обновления', { count: updatesResponse.data.result.length });
      
      // Ищем нужное сообщение
      const message = updatesResponse.data.result.find(
        update => update.channel_post?.message_id === messageId ||
                  update.message?.message_id === messageId
      );
      
      if (message) {
        return { data: { result: message.channel_post || message.message } };
      }
      
      throw new Error('Сообщение не найдено в обновлениях');
    });
    
    const message = messageResponse.data.result;
    log('STEP_5', 'Сообщение получено успешно', message);
    
    return message;
    
  } catch (error) {
    log('ERROR', 'Ошибка при получении сообщения', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

// Функция для парсинга сообщения (упрощенная версия)
function parseMessage(message) {
  log('STEP_6', 'Начало парсинга сообщения');
  
  const result = {
    messageId: message.message_id,
    date: message.date,
    text: message.text || message.caption || '',
    hasPhoto: !!message.photo,
    photoFileId: null
  };
  
  if (message.photo && message.photo.length > 0) {
    const largestPhoto = message.photo[message.photo.length - 1];
    result.photoFileId = largestPhoto.file_id;
    result.photoSize = { width: largestPhoto.width, height: largestPhoto.height };
  }
  
  // Парсим данные из текста
  const text = result.text;
  
  // Описание
  const descMatch = text.match(/📝\s*(.+?)(?=\n(?:💰|📦|🏷️|📞|#)|$)/s);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }
  
  // Цена
  const priceMatch = text.match(/💰\s*Цена:\s*(\d+(?:\s*\d+)*)\s*томан/i);
  if (priceMatch) {
    result.price = parseInt(priceMatch[1].replace(/\s+/g, ''), 10);
  }
  
  // Количество
  const qtyMatch = text.match(/📦\s*Количество:\s*(\d+)\s*шт/i);
  if (qtyMatch) {
    result.quantity = parseInt(qtyMatch[1], 10);
  }
  
  // Категория
  const catMatch = text.match(/🏷️\s*Категория:\s*(.+?)(?=\n|$)/i);
  if (catMatch) {
    result.category = catMatch[1].trim();
  }
  
  // Контакт
  const contactMatch = text.match(/📞\s*Контакт:\s*(.+?)(?=\n|$)/i);
  if (contactMatch) {
    result.contact = contactMatch[1].trim();
  }
  
  log('STEP_7', 'Парсинг завершен', result);
  
  return result;
}

// Главная функция
async function main() {
  try {
    log('START', 'Начало работы скрипта получения сообщения из канала');
    
    // Получаем сообщение
    const message = await getChannelMessage(CHANNEL_CHAT_ID, MESSAGE_ID);
    
    // Парсим сообщение
    const parsed = parseMessage(message);
    
    // Сохраняем результат
    const resultFile = path.join(__dirname, 'channel-message-result.json');
    fs.writeFileSync(resultFile, JSON.stringify({
      original: message,
      parsed: parsed,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    log('SUCCESS', 'Сообщение успешно получено и распарсено', {
      messageId: parsed.messageId,
      hasDescription: !!parsed.description,
      hasPrice: !!parsed.price,
      hasPhoto: parsed.hasPhoto
    });
    
    console.log('\n✅ Результат парсинга:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log(`\n📁 Полный результат сохранен в: ${resultFile}`);
    
  } catch (error) {
    log('FAILED', 'Скрипт завершился с ошибкой', {
      error: error.message,
      stack: error.stack
    });
    
    console.error('\n❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Ответ API:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { getChannelMessage, parseMessage };

