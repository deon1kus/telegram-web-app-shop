# 📢 Реализация уведомлений в канал уведомлений

## 🎯 Требования

При публикации нового сообщения в канале товаров (`-1003271699368`):
1. Сообщению присваивается очередной последовательный ID
2. Уведомление с ссылкой на сообщение отправляется в канал уведомлений (`-1003018207910`)
3. В уведомлении указывается наименование товара

---

## 📋 Реализация на бэкенде

### 1. Генерация последовательных ID

#### Вариант 1: Использование AUTO_INCREMENT в базе данных

```sql
-- Добавить поле для последовательного ID
ALTER TABLE products 
ADD COLUMN product_sequence_id INT AUTO_INCREMENT UNIQUE AFTER product_Id;
```

#### Вариант 2: Использование отдельной таблицы счетчиков

```sql
-- Создать таблицу для счетчиков
CREATE TABLE IF NOT EXISTS product_counters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  last_product_id INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Инициализация
INSERT INTO product_counters (last_product_id) VALUES (0) 
ON DUPLICATE KEY UPDATE last_product_id = last_product_id;
```

**Функция получения следующего ID:**
```javascript
async function getNextProductId() {
  const result = await db.query(
    'UPDATE product_counters SET last_product_id = last_product_id + 1'
  );
  
  const [counter] = await db.query(
    'SELECT last_product_id FROM product_counters LIMIT 1'
  );
  
  return counter[0].last_product_id;
}
```

---

### 2. Отправка уведомлений в канал

#### Endpoint: POST /api/telegram/send-notification

**Тело запроса:**
```json
{
  "notification_chat_id": -1003018207910,
  "type": "product_created",
  "product_name": "Новый iPhone 15 Pro Max",
  "product_id": 123,
  "message_link": "https://t.me/c/3271699368/6",
  "channel_chat_id": -1003271699368,
  "message_id": 6
}
```

**Реализация:**
```javascript
const axios = require('axios');
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendNotificationToChannel(data) {
  const { notification_chat_id, type, product_name, product_id, message_link } = data;
  
  let messageText = '';
  
  switch (type) {
    case 'product_created':
      messageText = `🆕 Новый товар #${product_id}\n\n📦 ${product_name}\n\n🔗 ${message_link}`;
      break;
    case 'product_updated':
      messageText = `✏️ Товар обновлен #${product_id}\n\n📦 ${product_name}\n\n🔗 ${message_link}`;
      break;
    case 'product_deleted':
      messageText = `🗑️ Товар удален #${product_id}\n\n📦 ${product_name}`;
      break;
  }
  
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: notification_chat_id,
        text: messageText,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// В endpoint
app.post('/api/telegram/send-notification', async (req, res) => {
  try {
    await sendNotificationToChannel(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 3. Интеграция в процесс создания товара

**Обновленный процесс создания товара из канала:**

```javascript
app.post('/api/products/from-telegram', async (req, res) => {
  try {
    const { telegram_message_id, description, price, ... } = req.body;
    
    // 1. Получить следующий последовательный ID
    const productSequenceId = await getNextProductId();
    
    // 2. Создать товар в базе данных
    const product = await createProduct({
      ...req.body,
      product_sequence_id: productSequenceId,
      telegram_message_id: telegram_message_id
    });
    
    // 3. Обновить сообщение в канале, добавив product_id
    const messageLink = generateMessageLink('-1003271699368', telegram_message_id);
    const updatedCaption = addProductIdToMessage(
      req.body.description || '',
      productSequenceId
    );
    
    // Редактируем сообщение в канале
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`,
      {
        chat_id: -1003271699368,
        message_id: telegram_message_id,
        caption: updatedCaption
      }
    );
    
    // 4. Отправить уведомление в канал уведомлений
    await sendNotificationToChannel({
      notification_chat_id: -1003018207910,
      type: 'product_created',
      product_name: req.body.product_name || req.body.description,
      product_id: productSequenceId,
      message_link: messageLink,
      channel_chat_id: -1003271699368,
      message_id: telegram_message_id
    });
    
    res.json({
      ...product,
      product_sequence_id: productSequenceId,
      notification_sent: true
    });
    
  } catch (error) {
    console.error('Error creating product from telegram:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

### 4. Генерация ссылки на сообщение

**Функция:**
```javascript
function generateMessageLink(channelChatId, messageId) {
  // Формат: https://t.me/c/{chat_id}/{message_id}
  // Убираем "-100" из начала
  const chatIdForLink = channelChatId.toString().replace(/^-100/, '');
  return `https://t.me/c/${chatIdForLink}/${messageId}`;
}
```

**Примеры:**
- Канал товаров: `-1003271699368` → `https://t.me/c/3271699368/6`
- Канал уведомлений: `-1003018207910` → `https://t.me/c/3018207910/123`

---

### 5. Обновление базы данных

```sql
-- Добавить поле для последовательного ID
ALTER TABLE products 
ADD COLUMN product_sequence_id INT UNIQUE AFTER product_Id;

-- Создать индекс для быстрого поиска
CREATE INDEX idx_product_sequence_id ON products(product_sequence_id);

-- Инициализировать счетчик (если используете отдельную таблицу)
CREATE TABLE IF NOT EXISTS product_counters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  last_product_id INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO product_counters (last_product_id) VALUES (0);
```

---

## 📝 Формат уведомлений

### Новый товар
```
🆕 Новый товар #123

📦 Новый iPhone 15 Pro Max 256GB

🔗 https://t.me/c/3271699368/6
```

### Обновление товара
```
✏️ Товар обновлен #123

📦 Новый iPhone 15 Pro Max 256GB

🔗 https://t.me/c/3271699368/6
```

### Удаление товара
```
🗑️ Товар удален #123

📦 Новый iPhone 15 Pro Max 256GB
```

---

## 🧪 Тестирование

### Тест 1: Создание товара с уведомлением

1. Отправить сообщение в канал товаров
2. Проверить что товару присвоен последовательный ID
3. Проверить что сообщение в канале обновлено с ID
4. Проверить что уведомление отправлено в канал уведомлений

### Тест 2: Обновление товара

1. Отредактировать сообщение в канале
2. Проверить что уведомление об обновлении отправлено

### Тест 3: Удаление товара

1. Удалить сообщение из канала
2. Проверить что уведомление об удалении отправлено

---

## ⚠️ Важные моменты

1. **Последовательные ID должны быть уникальными** - использовать транзакции БД
2. **Бот должен быть администратором обоих каналов**
3. **Ссылки должны быть правильного формата** - без "-100" в начале
4. **Обрабатывать ошибки отправки уведомлений** - не блокировать создание товара
5. **Логировать все уведомления** для отладки

---

## 📊 Структура данных

### Таблица products (обновленная)
```sql
CREATE TABLE products (
  product_Id INT PRIMARY KEY AUTO_INCREMENT,
  product_sequence_id INT UNIQUE,  -- Новое поле
  product_Name VARCHAR(255),
  price DECIMAL(10,2),
  quantity INT,
  description TEXT,
  telegram_message_id BIGINT UNIQUE,  -- Связь с сообщением
  telegram_channel_id BIGINT,
  sync_status ENUM('synced', 'pending', 'error') DEFAULT 'synced',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_sequence_id (product_sequence_id),
  INDEX idx_telegram_message_id (telegram_message_id)
);
```

---

## 🔄 Интеграция с существующим кодом

Все функции для работы с уведомлениями уже созданы во frontend:
- `src/utils/telegram-notifications.ts` - утилиты
- `src/framework/api/telegram-channel/send-notification.ts` - API hook

Нужно только реализовать backend endpoints согласно этой документации.

---

**Статус:** Готово к реализации на бэкенде  
**Приоритет:** Высокий

