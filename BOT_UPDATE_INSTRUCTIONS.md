# Инструкция по обновлению настроек Telegram бота

## Текущие настройки бота

### Основная информация
- **Название бота:** J.A.R.V.I.S.
- **Username:** @JARVIS_SHEVA_bot
- **Token:** `7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8`

### Канал для уведомлений
- **Ссылка:** https://t.me/+vZtVvSSVltwzYmMy
- **Chat ID:** `-1003018207910`
- **Название:** Уведомления магазина

## Что нужно обновить на бэкенде

### 1. Обновить токен бота в базе данных

Найдите запись бота в базе данных и обновите следующие поля:

```sql
UPDATE bot_settings 
SET 
  bot_username = 'JARVIS_SHEVA_bot',
  bot_token = '7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8',
  active = true
WHERE bot_username = 'JARVIS_SHEVA_bot';
```

Или через API (если есть):

```bash
PUT /api/bot/settings
{
  "bot_username": "JARVIS_SHEVA_bot",
  "bot_token": "7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8",
  "active": true
}
```

### 2. Обновить Chat ID канала для уведомлений

Обновите Chat ID канала в настройках уведомлений:

```sql
UPDATE notification_settings 
SET 
  channel_chat_id = '-1003018207910',
  channel_link = 'https://t.me/+vZtVvSSVltwzYmMy'
WHERE channel_name = 'Уведомления магазина';
```

Или через API:

```bash
PUT /api/notifications/settings
{
  "channel_chat_id": "-1003018207910",
  "channel_link": "https://t.me/+vZtVvSSVltwzYmMy",
  "channel_name": "Уведомления магазина"
}
```

### 3. Обновить переменные окружения (если используются)

Если бэкенд использует переменные окружения, обновите их:

```env
TELEGRAM_BOT_TOKEN=7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8
TELEGRAM_BOT_USERNAME=JARVIS_SHEVA_bot
TELEGRAM_CHANNEL_CHAT_ID=-1003018207910
TELEGRAM_CHANNEL_LINK=https://t.me/+vZtVvSSVltwzYmMy
```

После обновления перезапустите бэкенд сервер.

## Проверка работы

### 1. Проверка бота

1. Откройте бота в Telegram: [@JARVIS_SHEVA_bot](https://t.me/JARVIS_SHEVA_bot)
2. Отправьте команду `/start`
3. Бот должен ответить
4. Проверьте кнопку меню (если настроена)

### 2. Проверка уведомлений

1. Создайте тестовый заказ или выполните действие, которое должно отправить уведомление
2. Проверьте канал: https://t.me/+vZtVvSSVltwzYmMy
3. Уведомление должно появиться в канале

### 3. Проверка Web App

1. Откройте бота в Telegram
2. Нажмите на кнопку меню (если настроена в BotFather)
3. Web App должно открыться
4. Проверьте работу всех функций

## Настройка в BotFather

Если нужно обновить URL Web App в BotFather:

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/mybots`
3. Выберите **J.A.R.V.I.S.** (@JARVIS_SHEVA_bot)
4. Выберите **"Bot Settings"** → **"Menu Button"**
5. Укажите URL вашего Web App:
   ```
   https://ваш-сайт.netlify.app
   ```
   Например: `https://webappshop1.netlify.app`

## Важные замечания

⚠️ **Безопасность:**
- Токен бота должен храниться только на бэкенде
- Никогда не коммитьте токен в Git
- Используйте переменные окружения
- Регулярно проверяйте безопасность токена

⚠️ **Резервное копирование:**
- Сохраните старые настройки перед обновлением
- Сделайте резервную копию базы данных
- Документируйте все изменения

## Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [Документация бота](./BOT_CONFIG.md)

