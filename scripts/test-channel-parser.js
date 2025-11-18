/**
 * Тестовый скрипт для проверки парсера сообщений из Telegram канала
 * 
 * Использование:
 * node scripts/test-channel-parser.js
 */

// Импортируем функции парсера (упрощенная версия для Node.js)
// В реальном проекте это будет работать через модули

function parseProductMessage(message) {
  if (!message) {
    return null;
  }

  const result = {
    messageId: message.message_id || message.messageId
  };

  const text = message.caption || message.text || '';
  
  if (!text && !message.photo) {
    return null;
  }

  // Извлекаем фото
  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    const largestPhoto = message.photo[message.photo.length - 1];
    result.photoFileId = largestPhoto.file_id;
  }

  // Парсим описание
  const descriptionMatch = text.match(/📝\s*(.+?)(?=\n(?:💰|📦|🏷️|📞|#)|$)/s);
  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim();
  } else {
    const firstMarker = text.match(/(💰|📦|🏷️|📞|#)/);
    if (firstMarker) {
      result.description = text.substring(0, firstMarker.index).trim();
    } else {
      result.description = text.trim();
    }
  }

  // Парсим цену
  const priceMatch = text.match(/💰\s*Цена:\s*(\d+(?:\s*\d+)*)\s*томан/i);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/\s+/g, '');
    result.price = parseInt(priceStr, 10);
  }

  // Парсим количество
  const quantityMatch = text.match(/📦\s*Количество:\s*(\d+)\s*шт/i);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
  }

  // Парсим категорию
  const categoryMatch = text.match(/🏷️\s*Категория:\s*(.+?)(?=\n|$)/i);
  if (categoryMatch) {
    result.category = categoryMatch[1].trim();
  }

  // Парсим контакт
  const contactMatch = text.match(/📞\s*Контакт:\s*(.+?)(?=\n|$)/i);
  if (contactMatch) {
    result.contact = contactMatch[1].trim();
  }

  // Парсим product_id
  const productIdMatch = text.match(/#product_id[:\s]*(\d+)/i);
  if (productIdMatch) {
    result.productId = productIdMatch[1];
  }

  return result;
}

function validateParsedProduct(parsed) {
  if (!parsed.description || !parsed.price) {
    return false;
  }
  
  if (parsed.price <= 0) {
    return false;
  }
  
  if (parsed.quantity !== undefined && parsed.quantity < 0) {
    return false;
  }
  
  return true;
}

function formatProductMessage(product) {
  let text = `📝 ${product.description}\n\n`;
  
  if (product.price) {
    text += `💰 Цена: ${product.price.toLocaleString('ru-RU')} томан\n`;
  }
  
  if (product.quantity !== undefined) {
    text += `📦 Количество: ${product.quantity} шт\n`;
  }
  
  if (product.category) {
    text += `🏷️ Категория: ${product.category}\n`;
  }
  
  if (product.contact) {
    text += `📞 Контакт: ${product.contact}\n`;
  }
  
  if (product.productId) {
    text += `\n#product_id:${product.productId}`;
  }
  
  return text.trim();
}

// Тестовые сообщения
const testMessages = [
  {
    message_id: 123,
    photo: [
      { file_id: 'photo_small', width: 90, height: 90 },
      { file_id: 'photo_medium', width: 320, height: 320 },
      { file_id: 'photo_large', width: 1280, height: 1280 }
    ],
    caption: `📝 Новый iPhone 15 Pro Max 256GB в отличном состоянии

💰 Цена: 150000 томан
📦 Количество: 5 шт
🏷️ Категория: Электроника
📞 Контакт: @seller_username

#product_id:12345`
  },
  {
    message_id: 124,
    text: `📝 Простой товар без фото

💰 Цена: 5000 томан`
  },
  {
    message_id: 125,
    caption: `📝 Дорогой товар

💰 Цена: 1 500 000 томан
📦 Количество: 1 шт`
  },
  {
    message_id: 126,
    text: `📝 Товар без цены

📦 Количество: 10 шт`
  }
];

console.log('🧪 Тестирование парсера сообщений из Telegram канала\n');
console.log('='.repeat(80));

testMessages.forEach((message, index) => {
  console.log(`\n📨 Тест ${index + 1}:`);
  console.log('-'.repeat(80));
  
  const parsed = parseProductMessage(message);
  
  if (parsed) {
    console.log('✅ Сообщение распарсено:');
    console.log(JSON.stringify(parsed, null, 2));
    
    const isValid = validateParsedProduct(parsed);
    console.log(`\n${isValid ? '✅' : '❌'} Валидация: ${isValid ? 'ПРОШЛА' : 'НЕ ПРОШЛА'}`);
    
    if (isValid) {
      console.log('\n📤 Отформатированное сообщение:');
      console.log(formatProductMessage({
        description: parsed.description || '',
        price: parsed.price || 0,
        quantity: parsed.quantity,
        category: parsed.category,
        contact: parsed.contact,
        productId: parsed.productId ? parseInt(parsed.productId) : undefined
      }));
    }
  } else {
    console.log('❌ Сообщение не распознано как товар');
  }
  
  console.log('-'.repeat(80));
});

console.log('\n' + '='.repeat(80));
console.log('✅ Тестирование завершено');

