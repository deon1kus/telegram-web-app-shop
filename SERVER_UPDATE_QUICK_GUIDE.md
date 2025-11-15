# Быстрое обновление настроек бота на сервере

## Информация о сервере

- **IP:** 194.87.0.193
- **OS:** Ubuntu 24.04
- **User:** root
- **Password:** 6BFNsKPHU8

## Настройки для обновления

- **Bot Username:** JARVIS_SHEVA_bot
- **Bot Token:** 7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8
- **Channel Chat ID:** -1003018207910
- **Channel Link:** https://t.me/+vZtVvSSVltwzYmMy

## Быстрый способ (3 шага)

### Шаг 1: Подключитесь к серверу

```bash
ssh root@194.87.0.193
# Пароль: 6BFNsKPHU8
```

### Шаг 2: Найдите базу данных

```bash
mysql -u root -p -e "SHOW DATABASES;"
# Введите пароль MySQL (может быть таким же как root или другим)
```

Найдите базу данных проекта (обычно содержит слова: shop, telegram, webapp, или похожие).

### Шаг 3: Выполните SQL запросы

```bash
mysql -u root -p your_database_name
```

Затем выполните:

```sql
UPDATE bot_settings 
SET 
  bot_username = 'JARVIS_SHEVA_bot',
  bot_token = '7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8',
  active = 1
WHERE bot_username = 'JARVIS_SHEVA_bot'
   OR bot_username LIKE '%JARVIS%';

UPDATE notification_settings 
SET 
  channel_chat_id = '-1003018207910',
  channel_link = 'https://t.me/+vZtVvSSVltwzYmMy'
WHERE channel_name LIKE '%Notifications%' 
   OR channel_name LIKE '%Уведомления%';

-- Проверка
SELECT id, bot_username, active FROM bot_settings WHERE bot_username = 'JARVIS_SHEVA_bot';
```

## Альтернативный способ: Использование SQL файла

### Шаг 1: Загрузите SQL файл на сервер

С вашего компьютера:
```bash
scp scripts/update-bot-sql.sql root@194.87.0.193:/root/
```

### Шаг 2: Выполните SQL файл

На сервере:
```bash
mysql -u root -p your_database_name < /root/update-bot-sql.sql
```

## Проверка работы

После обновления:

1. **Проверьте бота:** [@JARVIS_SHEVA_bot](https://t.me/JARVIS_SHEVA_bot)
2. **Проверьте канал:** https://t.me/+vZtVvSSVltwzYmMy
3. **Создайте тестовый заказ** и проверьте уведомление

## Дополнительная информация

- Подробная инструкция: `scripts/server-update-instructions.md`
- SQL файл: `scripts/update-bot-sql.sql`
- Конфигурация бота: `BOT_CONFIG.md`

