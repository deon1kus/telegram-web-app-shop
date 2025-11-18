/**
 * Скрипт для проверки сообщений в канале товаров
 * 
 * Использование:
 * node scripts/check-channel-messages.js
 */

const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8';
const CHANNEL_CHAT_ID = '-1003271699368';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function checkChannelMessages() {
  try {
    console.log('🔍 Проверка сообщений в канале товаров...\n');
    console.log(`Канал: ${CHANNEL_CHAT_ID}\n`);
    
    // Получаем последние обновления
    console.log('📥 Получение последних обновлений...');
    const updatesResponse = await axios.get(`${TELEGRAM_API}/getUpdates`, {
      params: {
        allowed_updates: ['channel_post', 'edited_channel_post'],
        limit: 100,
        offset: -100 // Последние 100 сообщений
      }
    });
    
    const updates = updatesResponse.data.result || [];
    console.log(`✅ Получено обновлений: ${updates.length}\n`);
    
    // Фильтруем сообщения из нужного канала
    const channelMessages = updates.filter(update => {
      const post = update.channel_post || update.edited_channel_post;
      return post && post.chat && post.chat.id.toString() === CHANNEL_CHAT_ID.replace('-100', '');
    });
    
    console.log(`📨 Сообщений из канала товаров: ${channelMessages.length}\n`);
    
    if (channelMessages.length === 0) {
      console.log('⚠️ Сообщений не найдено. Возможные причины:');
      console.log('   1. Бот не является администратором канала');
      console.log('   2. Сообщения были опубликованы до добавления бота');
      console.log('   3. Webhook не настроен или не работает\n');
      
      // Проверяем права бота
      console.log('🔐 Проверка прав бота в канале...');
      try {
        const chatMember = await axios.get(`${TELEGRAM_API}/getChatMember`, {
          params: {
            chat_id: CHANNEL_CHAT_ID,
            user_id: await getBotId()
          }
        });
        
        const status = chatMember.data.result.status;
        console.log(`   Статус бота: ${status}`);
        
        if (status === 'administrator') {
          console.log('   ✅ Бот является администратором');
        } else {
          console.log('   ❌ Бот НЕ является администратором!');
          console.log('   ⚠️ Нужно добавить бота как администратора канала');
        }
      } catch (error) {
        console.log('   ❌ Не удалось проверить права бота');
        console.log(`   Ошибка: ${error.response?.data?.description || error.message}`);
      }
      
      return;
    }
    
    // Показываем последние сообщения
    console.log('📋 Последние сообщения из канала:\n');
    console.log('='.repeat(80));
    
    channelMessages.slice(-5).reverse().forEach((update, index) => {
      const post = update.channel_post || update.edited_channel_post;
      const isEdited = !!update.edited_channel_post;
      
      console.log(`\n${index + 1}. Сообщение ID: ${post.message_id} ${isEdited ? '(отредактировано)' : ''}`);
      console.log(`   Дата: ${new Date(post.date * 1000).toLocaleString('ru-RU')}`);
      
      if (post.photo) {
        console.log('   📷 Есть фото');
      }
      
      if (post.caption || post.text) {
        const text = post.caption || post.text;
        console.log(`   Текст: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        
        // Проверяем наличие product_id
        if (text.includes('#product_id')) {
          const productIdMatch = text.match(/#product_id[:\s]*(\d+)/i);
          if (productIdMatch) {
            console.log(`   ✅ Product ID найден: #${productIdMatch[1]}`);
          }
        } else {
          console.log('   ⚠️ Product ID не найден (товар еще не обработан)');
        }
      }
      
      console.log('-'.repeat(80));
    });
    
    // Проверяем webhook
    console.log('\n🔗 Проверка webhook...');
    try {
      const webhookInfo = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
      const info = webhookInfo.data.result;
      
      console.log(`   URL: ${info.url || 'НЕ НАСТРОЕН'}`);
      console.log(`   Ожидает обновлений: ${info.pending_update_count || 0}`);
      console.log(`   Последняя ошибка: ${info.last_error_message || 'НЕТ'}`);
      
      if (!info.url) {
        console.log('\n   ⚠️ Webhook не настроен!');
        console.log('   Нужно настроить webhook на бэкенде');
      } else if (info.last_error_message) {
        console.log('\n   ❌ Webhook имеет ошибки!');
        console.log(`   Ошибка: ${info.last_error_message}`);
      } else {
        console.log('\n   ✅ Webhook настроен и работает');
      }
    } catch (error) {
      console.log('   ❌ Не удалось проверить webhook');
    }
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Ответ API:', error.response.data);
    }
  }
}

async function getBotId() {
  try {
    const response = await axios.get(`${TELEGRAM_API}/getMe`);
    return response.data.result.id;
  } catch (error) {
    return null;
  }
}

// Запуск
if (require.main === module) {
  checkChannelMessages();
}

module.exports = { checkChannelMessages };

