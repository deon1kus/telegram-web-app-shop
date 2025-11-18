/**
 * Скрипт для автоматического обновления настроек Telegram бота через API
 * 
 * Использование:
 * node scripts/update-bot-config.js
 * 
 * Или с параметрами:
 * node scripts/update-bot-config.js --token=YOUR_TOKEN --channel-id=YOUR_CHAT_ID
 */

const axios = require('axios');

// Конфигурация по умолчанию
const DEFAULT_CONFIG = {
  apiUrl: process.env.VITE_API_URL || 'http://194.87.0.193',
  botUsername: 'JARVIS_SHEVA_bot',
  botToken: '7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8',
  channelChatId: '-1003018207910',
  channelLink: 'https://t.me/+vZtVvSSVltwzYmMy',
  channelName: 'Уведомления магазина'
};

// Парсинг аргументов командной строки
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };
  
  args.forEach(arg => {
    if (arg.startsWith('--token=')) {
      config.botToken = arg.split('=')[1];
    } else if (arg.startsWith('--channel-id=')) {
      config.channelChatId = arg.split('=')[1];
    } else if (arg.startsWith('--api-url=')) {
      config.apiUrl = arg.split('=')[1];
    }
  });
  
  return config;
}

// Обновление настроек бота через API
async function updateBotSettings(config) {
  const apiUrl = `${config.apiUrl}/api`;
  
  console.log('🔄 Обновление настроек бота...');
  console.log(`📡 API URL: ${apiUrl}`);
  console.log(`🤖 Bot: ${config.botUsername}`);
  console.log(`🔑 Token: ${config.botToken.substring(0, 10)}...`);
  console.log(`📢 Channel Chat ID: ${config.channelChatId}`);
  console.log('');
  
  try {
    // Получаем текущие настройки
    console.log('📥 Получение текущих настроек...');
    const getResponse = await axios.get(`${apiUrl}/bot-setting`);
    
    if (!getResponse.data || !getResponse.data.id) {
      throw new Error('Не удалось получить настройки бота');
    }
    
    const currentSettings = getResponse.data;
    console.log(`✅ Текущие настройки получены (ID: ${currentSettings.id})`);
    console.log('');
    
    // Подготавливаем данные для обновления
    const updateData = {
      ...currentSettings,
      bot_username: config.botUsername,
      bot_token: config.botToken,
      active: true
    };
    
    // Обновляем настройки бота
    console.log('📤 Отправка обновленных настроек...');
    const updateResponse = await axios.put(
      `${apiUrl}/bot-setting/${currentSettings.id}`,
      updateData
    );
    
    if (updateResponse.data) {
      console.log('✅ Настройки бота успешно обновлены!');
      console.log('');
      console.log('Обновленные данные:');
      console.log(`  - Bot Username: ${updateResponse.data.bot_username || config.botUsername}`);
      console.log(`  - Bot Token: ${(updateResponse.data.bot_token || config.botToken).substring(0, 10)}...`);
      console.log(`  - Active: ${updateResponse.data.active ? '✅' : '❌'}`);
      return true;
    } else {
      throw new Error('Не удалось обновить настройки');
    }
  } catch (error) {
    console.error('❌ Ошибка при обновлении настроек бота:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error(`   Не удалось подключиться к API: ${error.message}`);
      console.error(`   Проверьте, что сервер доступен по адресу: ${config.apiUrl}`);
    } else {
      console.error(`   ${error.message}`);
    }
    return false;
  }
}

// Обновление настроек канала (если есть такой API)
async function updateChannelSettings(config) {
  const apiUrl = `${config.apiUrl}/api`;
  
  console.log('');
  console.log('🔄 Обновление настроек канала...');
  
  try {
    // Попытка обновить настройки канала
    // Это зависит от структуры вашего API
    const channelData = {
      channel_chat_id: config.channelChatId,
      channel_link: config.channelLink,
      channel_name: config.channelName
    };
    
    // Если есть отдельный endpoint для канала
    try {
      const response = await axios.put(
        `${apiUrl}/notifications/settings`,
        channelData
      );
      console.log('✅ Настройки канала успешно обновлены!');
      return true;
    } catch (error) {
      // Если endpoint не существует, просто логируем информацию
      console.log('ℹ️  Настройки канала должны быть обновлены вручную:');
      console.log(`   Chat ID: ${config.channelChatId}`);
      console.log(`   Link: ${config.channelLink}`);
      return false;
    }
  } catch (error) {
    console.log('ℹ️  Настройки канала должны быть обновлены вручную');
    return false;
  }
}

// Главная функция
async function main() {
  console.log('🚀 Скрипт обновления настроек Telegram бота');
  console.log('=' .repeat(50));
  console.log('');
  
  const config = parseArgs();
  
  // Обновляем настройки бота
  const botUpdated = await updateBotSettings(config);
  
  // Обновляем настройки канала
  await updateChannelSettings(config);
  
  console.log('');
  console.log('=' .repeat(50));
  
  if (botUpdated) {
    console.log('✅ Обновление завершено успешно!');
    console.log('');
    console.log('📋 Следующие шаги:');
    console.log('   1. Проверьте работу бота в Telegram');
    console.log('   2. Проверьте отправку уведомлений в канал');
    console.log('   3. Убедитесь, что Web App открывается корректно');
  } else {
    console.log('⚠️  Обновление завершено с ошибками');
    console.log('');
    console.log('📋 Проверьте:');
    console.log('   1. Доступность API сервера');
    console.log('   2. Правильность токена бота');
    console.log('   3. Логи сервера на наличие ошибок');
  }
  
  process.exit(botUpdated ? 0 : 1);
}

// Запуск скрипта
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { updateBotSettings, updateChannelSettings };

