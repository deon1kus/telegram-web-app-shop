# Конфигурация Telegram бота

## Информация о боте

### Основные данные

- **Название:** J.A.R.V.I.S.
- **Username:** @JARVIS_SHEVA_bot
- **Token:** `7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8`

### Канал для уведомлений

- **Ссылка:** https://t.me/+vZtVvSSVltwzYmMy
- **Chat ID:** `-1003018207910`
- **Название:** Уведомления магазина

## Настройка бота

### 1. Настройка в BotFather

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/mybots`
3. Выберите **J.A.R.V.I.S.** (@JARVIS_SHEVA_bot)
4. Выберите **"Bot Settings"** → **"Menu Button"**
5. Укажите URL вашего Web App:
   ```
   https://ваш-сайт.netlify.app
   ```
   Например: `https://webappshop1.netlify.app`

### 2. Настройка на бэкенде

Настройки бота должны быть сохранены в базе данных бэкенда:

```json
{
  "bot_username": "JARVIS_SHEVA_bot",
  "bot_token": "7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8",
  "active": true
}
```

### 3. Настройка канала для уведомлений

Chat ID канала должен быть настроен в бэкенде для отправки уведомлений:

```
Chat ID: -1003018207910
```

## Проверка работы

### Проверка бота

1. Откройте бота в Telegram: [@JARVIS_SHEVA_bot](https://t.me/JARVIS_SHEVA_bot)
2. Нажмите на кнопку меню (если настроена)
3. Web App должно открыться
4. Проверьте работу всех функций

### Проверка уведомлений

1. Выполните действие, которое должно отправить уведомление (например, новый заказ)
2. Проверьте канал: https://t.me/+vZtVvSSVltwzYmMy
3. Уведомление должно появиться в канале

## API для работы с ботом

Все запросы к API бота идут через бэкенд:

```
POST /api/bot/settings
GET /api/bot/settings
POST /api/bot/send-notification
```

## Безопасность

⚠️ **Важно:** 
- Токен бота должен храниться только на бэкенде
- Никогда не коммитьте токен в Git
- Используйте переменные окружения на сервере
- Токен в этом файле - только для документации

## Обновление настроек

Если нужно обновить настройки бота:

1. Обновите данные в базе данных бэкенда
2. Обновите этот файл с новой информацией
3. Проверьте работу бота и уведомлений

## Полезные ссылки

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)

