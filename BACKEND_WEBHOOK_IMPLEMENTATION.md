# 🔧 Реализация Webhook на бэкенде для Telegram канала

## 📋 Требования

Для работы интеграции с каналом нужно создать на бэкенде следующие endpoints:

---

## 1. POST /api/telegram/webhook

**Назначение:** Получение событий от Telegram Bot API

**Тело запроса (от Telegram):**
```json
{
  "update_id": 123456789,
  "channel_post": {
    "message_id": 6,
    "date": 1234567890,
    "chat": {
      "id": -1003271699368,
      "type": "channel",
      "title": "Название канала"
    },
    "photo": [...],
    "caption": "📝 Описание товара\n💰 Цена: 15000 томан"
  }
}
```

**Обработка:**
1. Проверить что сообщение из нужного канала (`chat.id === -1003271699368`)
2. Распарсить сообщение (использовать логику из `src/utils/telegram-channel.ts`)
3. Если это новое сообщение → создать товар
4. Если это редактирование → обновить товар
5. Вернуть успешный ответ Telegram

**Пример реализации (Node.js/Express):**
```javascript
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const { channel_post, edited_channel_post } = req.body;
    const message = channel_post || edited_channel_post;
    
    // Проверяем что сообщение из нужного канала
    if (message?.chat?.id !== -1003271699368) {
      return res.status(200).json({ ok: true }); // Игнорируем другие каналы
    }
    
    // Парсим сообщение (используем логику из telegram-channel.ts)
    const parsed = parseProductMessage(message);
    
    if (!parsed || !validateParsedProduct(parsed)) {
      console.log('Сообщение не является товаром или невалидно');
      return res.status(200).json({ ok: true });
    }
    
    // Находим категорию по названию (если указана)
    let categoryIds = [];
    if (parsed.category) {
      const category = await findCategoryByName(parsed.category);
      if (category) {
        categoryIds = [category.id];
      }
    }
    
    // Загружаем фото из Telegram
    let photoUrl = null;
    if (parsed.photoFileId) {
      photoUrl = await downloadPhotoFromTelegram(parsed.photoFileId);
    }
    
    // Создаем или обновляем товар
    if (channel_post) {
      // Новое сообщение
      await createProductFromTelegram({
        messageId: parsed.messageId,
        description: parsed.description,
        price: parsed.price,
        quantity: parsed.quantity || 0,
        categoryIds,
        photoUrl,
        userId: adminUserId
      });
    } else if (edited_channel_post) {
      // Редактирование
      await updateProductFromTelegram({
        messageId: parsed.messageId,
        description: parsed.description,
        price: parsed.price,
        quantity: parsed.quantity,
        categoryIds,
        photoUrl,
        userId: adminUserId
      });
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Всегда возвращаем 200 для Telegram
  }
});
```

---

## 2. POST /api/products/from-telegram

**Назначение:** Создание товара из данных Telegram сообщения

**Тело запроса:**
```json
{
  "user_id": "123456789",
  "product_name": "Новый iPhone 15 Pro Max",
  "description": "Новый iPhone 15 Pro Max 256GB",
  "price": 150000,
  "quantity": 5,
  "category_ids": [1],
  "photos": ["path/to/photo.jpg"],
  "telegram_message_id": 6,
  "telegram_channel_id": -1003271699368,
  "category_name": "Электроника",
  "contact": "@seller_username",
  "photo_file_id": "AgACAgIAAxkBAAIB..."
}
```

**Ответ:**
```json
{
  "product_Id": 123,
  "product_Name": "Новый iPhone 15 Pro Max",
  "price": 150000,
  "quantity": 5,
  "telegram_message_id": 6
}
```

**Логика:**
1. Найти категорию по `category_name` (если указана)
2. Загрузить фото из Telegram по `photo_file_id` (если указан)
3. Создать товар в базе данных
4. Сохранить `telegram_message_id` для связи
5. Вернуть созданный товар

---

## 3. PUT /api/products/from-telegram/:messageId

**Назначение:** Обновление товара по message_id

**Параметры:**
- `messageId` - ID сообщения в Telegram

**Тело запроса:**
```json
{
  "description": "Обновленное описание",
  "price": 140000,
  "quantity": 3,
  "category_name": "Электроника",
  "photo_file_id": "AgACAgIAAxkBAAIB...",
  "user_id": "123456789"
}
```

**Логика:**
1. Найти товар по `telegram_message_id`
2. Обновить данные товара
3. Обновить фото (если указано)
4. Вернуть обновленный товар

---

## 4. DELETE /api/products/from-telegram/:messageId

**Назначение:** Удаление товара по message_id

**Параметры:**
- `messageId` - ID сообщения в Telegram

**Тело запроса:**
```json
{
  "user_id": "123456789"
}
```

**Логика:**
1. Найти товар по `telegram_message_id`
2. Удалить товар из базы данных
3. Вернуть подтверждение

---

## 5. Функции-помощники

### downloadPhotoFromTelegram(photoFileId)

```javascript
async function downloadPhotoFromTelegram(photoFileId) {
  // 1. Получить файл через getFile
  const fileResponse = await axios.get(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
    { params: { file_id: photoFileId } }
  );
  
  const filePath = fileResponse.data.result.file_path;
  
  // 2. Скачать файл
  const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  const photoResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
  
  // 3. Конвертировать в base64
  const base64 = Buffer.from(photoResponse.data).toString('base64');
  
  // 4. Загрузить через существующий API загрузки фото
  const uploadResponse = await axios.post(`${API_URL}/api/product_photos`, {
    photo_base64: base64
  });
  
  return uploadResponse.data; // Путь к сохраненному фото
}
```

### findCategoryByName(categoryName)

```javascript
async function findCategoryByName(categoryName) {
  // Поиск категории в базе данных по названию
  const category = await db.query(
    'SELECT * FROM categories WHERE category_Name = ?',
    [categoryName]
  );
  
  return category[0] || null;
}
```

### parseProductMessage(message)

Использовать логику из `src/utils/telegram-channel.ts` или портировать на бэкенд.

---

## 6. Настройка Webhook в Telegram

После создания endpoint нужно настроить webhook:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "allowed_updates": ["channel_post", "edited_channel_post"]
  }'
```

**Важно:**
- URL должен быть HTTPS
- URL должен быть доступен из интернета
- Бот должен быть администратором канала

---

## 7. Обновление базы данных

Добавить поля в таблицу `products`:

```sql
ALTER TABLE products 
ADD COLUMN telegram_message_id BIGINT UNIQUE,
ADD COLUMN telegram_channel_id BIGINT,
ADD COLUMN sync_status ENUM('synced', 'pending', 'error') DEFAULT 'synced',
ADD INDEX idx_telegram_message_id (telegram_message_id);
```

---

## 8. Тестирование

### Тест 1: Отправка тестового сообщения в канал

1. Отправьте сообщение в канал в формате:
```
📝 Тестовый товар

💰 Цена: 10000 томан
📦 Количество: 1 шт
```

2. Проверьте что webhook получил запрос
3. Проверьте что товар создан в базе данных

### Тест 2: Редактирование сообщения

1. Отредактируйте сообщение в канале
2. Проверьте что товар обновился в базе данных

### Тест 3: Удаление сообщения

1. Удалите сообщение из канала
2. Проверьте что товар удален из базы данных (через getUpdates)

---

## 📝 Примечания

- Всегда возвращайте `{ ok: true }` для Telegram, даже при ошибках
- Логируйте все ошибки для отладки
- Проверяйте что сообщения из нужного канала
- Обрабатывайте случаи когда категория не найдена
- Обрабатывайте случаи когда фото не загрузилось

---

**Статус:** Готово к реализации на бэкенде  
**Приоритет:** Высокий

