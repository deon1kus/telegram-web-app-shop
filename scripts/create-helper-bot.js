/**
 * Скрипт для создания бота-помощника для пошагового создания товаров
 * 
 * Этот скрипт демонстрирует логику работы бота-помощника
 * Для реальной работы нужно интегрировать с Telegram Bot API на бэкенде
 */

const fs = require('fs');
const path = require('path');

// Состояния диалога
const STATES = {
  IDLE: 'idle',
  WAITING_PHOTO: 'waiting_photo',
  WAITING_DESCRIPTION: 'waiting_description',
  WAITING_PRICE: 'waiting_price',
  WAITING_QUANTITY: 'waiting_quantity',
  WAITING_CATEGORY: 'waiting_category',
  WAITING_CONTACT: 'waiting_contact',
  CONFIRMING: 'confirming'
};

// Хранилище состояний пользователей (в реальности - база данных)
const userStates = {};

// Данные товара для каждого пользователя
const productData = {};

/**
 * Обработка команды /add_product
 */
function handleAddProduct(userId) {
  userStates[userId] = STATES.WAITING_PHOTO;
  productData[userId] = {};
  
  return {
    text: '📸 Отправьте фото товара',
    reply_markup: {
      inline_keyboard: [[
        { text: '❌ Отменить', callback_data: 'cancel' }
      ]]
    }
  };
}

/**
 * Обработка фото
 */
function handlePhoto(userId, photoFileId) {
  if (userStates[userId] !== STATES.WAITING_PHOTO) {
    return { text: '❌ Ошибка: неожиданное фото. Начните с /add_product' };
  }
  
  productData[userId].photoFileId = photoFileId;
  userStates[userId] = STATES.WAITING_DESCRIPTION;
  
  return {
    text: '✅ Фото получено!\n\n📝 Теперь отправьте описание товара',
    reply_markup: {
      inline_keyboard: [[
        { text: '❌ Отменить', callback_data: 'cancel' }
      ]]
    }
  };
}

/**
 * Обработка описания
 */
function handleDescription(userId, description) {
  if (userStates[userId] !== STATES.WAITING_DESCRIPTION) {
    return { text: '❌ Ошибка: неожиданное описание' };
  }
  
  productData[userId].description = description;
  userStates[userId] = STATES.WAITING_PRICE;
  
  return {
    text: `✅ Описание сохранено: "${description}"\n\n💰 Укажите цену в томанах (только число)`,
    reply_markup: {
      inline_keyboard: [[
        { text: '❌ Отменить', callback_data: 'cancel' }
      ]]
    }
  };
}

/**
 * Обработка цены
 */
function handlePrice(userId, priceText) {
  if (userStates[userId] !== STATES.WAITING_PRICE) {
    return { text: '❌ Ошибка: неожиданная цена' };
  }
  
  const price = parseInt(priceText.replace(/\s+/g, ''), 10);
  
  if (isNaN(price) || price <= 0) {
    return {
      text: '❌ Неверный формат цены. Укажите число больше 0.\n\n💰 Укажите цену в томанах:'
    };
  }
  
  productData[userId].price = price;
  userStates[userId] = STATES.WAITING_QUANTITY;
  
  return {
    text: `✅ Цена: ${price.toLocaleString('ru-RU')} томан\n\n📦 Укажите количество на складе (только число)`,
    reply_markup: {
      inline_keyboard: [[
        { text: '❌ Отменить', callback_data: 'cancel' }
      ]]
    }
  };
}

/**
 * Обработка количества
 */
function handleQuantity(userId, quantityText) {
  if (userStates[userId] !== STATES.WAITING_QUANTITY) {
    return { text: '❌ Ошибка: неожиданное количество' };
  }
  
  const quantity = parseInt(quantityText, 10);
  
  if (isNaN(quantity) || quantity < 0) {
    return {
      text: '❌ Неверный формат количества. Укажите число >= 0.\n\n📦 Укажите количество:'
    };
  }
  
  productData[userId].quantity = quantity;
  userStates[userId] = STATES.WAITING_CATEGORY;
  
  // Здесь нужно получить список категорий из API
  // Для примера используем статический список
  const categories = [
    { id: 1, name: 'Электроника' },
    { id: 2, name: 'Одежда' },
    { id: 3, name: 'Еда' },
    { id: 4, name: 'Другое' }
  ];
  
  const categoryButtons = categories.map(cat => [
    { text: cat.name, callback_data: `category_${cat.id}` }
  ]);
  
  return {
    text: `✅ Количество: ${quantity} шт\n\n🏷️ Выберите категорию:`,
    reply_markup: {
      inline_keyboard: [
        ...categoryButtons,
        [{ text: '❌ Отменить', callback_data: 'cancel' }]
      ]
    }
  };
}

/**
 * Обработка выбора категории
 */
function handleCategory(userId, categoryId, categoryName) {
  if (userStates[userId] !== STATES.WAITING_CATEGORY) {
    return { text: '❌ Ошибка: неожиданная категория' };
  }
  
  productData[userId].categoryId = categoryId;
  productData[userId].categoryName = categoryName;
  userStates[userId] = STATES.WAITING_CONTACT;
  
  return {
    text: `✅ Категория: ${categoryName}\n\n📞 Укажите контакт (username или телефон, можно пропустить - отправьте "-")`,
    reply_markup: {
      inline_keyboard: [[
        { text: 'Пропустить', callback_data: 'skip_contact' },
        { text: '❌ Отменить', callback_data: 'cancel' }
      ]]
    }
  };
}

/**
 * Обработка контакта
 */
function handleContact(userId, contact) {
  if (userStates[userId] !== STATES.WAITING_CONTACT) {
    return { text: '❌ Ошибка: неожиданный контакт' };
  }
  
  if (contact && contact !== '-') {
    productData[userId].contact = contact;
  }
  
  userStates[userId] = STATES.CONFIRMING;
  
  const data = productData[userId];
  const summary = `
✅ Все данные собраны!

━━━━━━━━━━━━━━━━━━━━
📷 Фото: ${data.photoFileId ? '✅' : '❌'}
📝 Описание: ${data.description || 'НЕТ'}
💰 Цена: ${data.price ? data.price.toLocaleString('ru-RU') + ' томан' : 'НЕТ'}
📦 Количество: ${data.quantity !== undefined ? data.quantity + ' шт' : 'НЕТ'}
🏷️ Категория: ${data.categoryName || 'НЕТ'}
📞 Контакт: ${data.contact || 'НЕТ'}
━━━━━━━━━━━━━━━━━━━━

Опубликовать товар в канале?
  `;
  
  return {
    text: summary,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Да, опубликовать', callback_data: 'confirm_publish' },
          { text: '✏️ Редактировать', callback_data: 'edit' }
        ],
        [
          { text: '❌ Отменить', callback_data: 'cancel' }
        ]
      ]
    }
  };
}

/**
 * Форматирование сообщения для канала
 */
function formatChannelMessage(data) {
  let text = `📝 ${data.description}\n\n`;
  
  if (data.price) {
    text += `💰 Цена: ${data.price.toLocaleString('ru-RU')} томан\n`;
  }
  
  if (data.quantity !== undefined) {
    text += `📦 Количество: ${data.quantity} шт\n`;
  }
  
  if (data.categoryName) {
    text += `🏷️ Категория: ${data.categoryName}\n`;
  }
  
  if (data.contact) {
    text += `📞 Контакт: ${data.contact}\n`;
  }
  
  return text.trim();
}

/**
 * Публикация в канале
 */
async function publishToChannel(data, channelId, botToken) {
  const axios = require('axios');
  const TELEGRAM_API = `https://api.telegram.org/bot${botToken}`;
  
  const messageText = formatChannelMessage(data);
  
  try {
    const response = await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: channelId,
      photo: data.photoFileId,
      caption: messageText
    });
    
    return {
      success: true,
      messageId: response.data.result.message_id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Отмена создания товара
 */
function handleCancel(userId) {
  userStates[userId] = STATES.IDLE;
  delete productData[userId];
  
  return {
    text: '❌ Создание товара отменено',
    reply_markup: { remove_keyboard: true }
  };
}

// Экспорт функций для использования в бэкенде
module.exports = {
  STATES,
  handleAddProduct,
  handlePhoto,
  handleDescription,
  handlePrice,
  handleQuantity,
  handleCategory,
  handleContact,
  handleCancel,
  formatChannelMessage,
  publishToChannel,
  getUserState: (userId) => userStates[userId],
  getProductData: (userId) => productData[userId]
};

// Демонстрация работы (если запущен напрямую)
if (require.main === module) {
  console.log('🤖 Бот-помощник для создания товаров\n');
  console.log('='.repeat(80));
  console.log('\nЭтот скрипт демонстрирует логику работы бота.');
  console.log('Для реальной работы нужно интегрировать с Telegram Bot API на бэкенде.\n');
  console.log('Пример использования:');
  console.log('1. Пользователь: /add_product');
  console.log('2. Бот:', handleAddProduct('user123').text);
  console.log('3. Пользователь: [отправляет фото]');
  console.log('4. Бот:', handlePhoto('user123', 'photo123').text);
  console.log('\n' + '='.repeat(80));
}

