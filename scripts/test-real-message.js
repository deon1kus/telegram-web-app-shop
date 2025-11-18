/**
 * Тестовый скрипт для проверки реального сообщения из канала
 * 
 * Использование:
 * node scripts/test-real-message.js
 */

const { getChannelMessage, parseMessage } = require('./get-channel-message-cjs');

async function testRealMessage() {
  console.log('🧪 Тестирование реального сообщения из канала\n');
  console.log('='.repeat(80));
  
  try {
    // Получаем сообщение
    console.log('📥 Получение сообщения из канала...');
    const message = await getChannelMessage('-1003271699368', 6);
    
    console.log('\n✅ Сообщение получено!');
    console.log('\n📋 Исходное сообщение:');
    console.log(JSON.stringify(message, null, 2));
    
    // Парсим
    console.log('\n🔍 Парсинг сообщения...');
    const parsed = parseMessage(message);
    
    console.log('\n✅ Результат парсинга:');
    console.log(JSON.stringify(parsed, null, 2));
    
    // Проверяем валидность
    console.log('\n📊 Проверка данных:');
    console.log(`- Описание: ${parsed.description ? '✅' : '❌'} ${parsed.description || 'НЕТ'}`);
    console.log(`- Цена: ${parsed.price ? '✅' : '❌'} ${parsed.price || 'НЕТ'}`);
    console.log(`- Количество: ${parsed.quantity ? '✅' : '❌'} ${parsed.quantity || 'НЕТ'}`);
    console.log(`- Категория: ${parsed.category ? '✅' : '❌'} ${parsed.category || 'НЕТ'}`);
    console.log(`- Контакт: ${parsed.contact ? '✅' : '❌'} ${parsed.contact || 'НЕТ'}`);
    console.log(`- Фото: ${parsed.hasPhoto ? '✅' : '❌'} ${parsed.photoFileId || 'НЕТ'}`);
    
    const isValid = parsed.description && parsed.price;
    console.log(`\n${isValid ? '✅' : '❌'} Валидация: ${isValid ? 'ПРОШЛА' : 'НЕ ПРОШЛА'}`);
    
    if (isValid) {
      console.log('\n🎉 Сообщение успешно распарсено и готово к созданию товара!');
    } else {
      console.log('\n⚠️ Сообщение не содержит всех необходимых данных для создания товара');
    }
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Ответ API:', error.response.data);
    }
    process.exit(1);
  }
}

testRealMessage();

