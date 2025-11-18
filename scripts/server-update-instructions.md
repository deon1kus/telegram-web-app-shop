# Инструкция по обновлению настроек бота на сервере

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

## Способ 1: Через SSH и SQL (рекомендуется)

### Шаг 1: Подключитесь к серверу

```bash
ssh root@194.87.0.193
# Пароль: 6BFNsKPHU8
```

### Шаг 2: Найдите базу данных

```bash
# Проверка MySQL
mysql -u root -p -e "SHOW DATABASES;"

# Или проверка PostgreSQL
psql -U postgres -l
```

### Шаг 3: Найдите имя базы данных проекта

Обычно это может быть:
- `telegram_shop`
- `webapp_shop`
- `shop_db`
- или другое имя

### Шаг 4: Выполните SQL запросы

#### Для MySQL:

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
```

#### Для PostgreSQL:

```bash
psql -U postgres -d your_database_name
```

Затем выполните те же SQL запросы (замените `active = 1` на `active = true`).

### Шаг 5: Проверьте обновление

```sql
SELECT id, bot_username, active FROM bot_settings WHERE bot_username = 'JARVIS_SHEVA_bot';
SELECT channel_chat_id, channel_link FROM notification_settings WHERE channel_chat_id = '-1003018207910';
```

## Способ 2: Использование SQL файла

### Шаг 1: Загрузите SQL файл на сервер

```bash
# С вашего компьютера
scp scripts/update-bot-sql.sql root@194.87.0.193:/root/
```

### Шаг 2: Выполните SQL файл

```bash
# На сервере, для MySQL
mysql -u root -p your_database_name < /root/update-bot-sql.sql

# Или для PostgreSQL
psql -U postgres -d your_database_name -f /root/update-bot-sql.sql
```

## Способ 3: Через веб-интерфейс (phpMyAdmin или pgAdmin)

1. Откройте phpMyAdmin (для MySQL) или pgAdmin (для PostgreSQL)
2. Выберите базу данных проекта
3. Выполните SQL запросы из файла `update-bot-sql.sql`

## Способ 4: Через API (если доступен)

Если API требует аутентификации, используйте:

```bash
# Получение токена авторизации (если требуется)
TOKEN=$(curl -X POST http://194.87.0.193/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' | jq -r '.token')

# Обновление настроек бота
curl -X PUT http://194.87.0.193/api/bot-setting/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bot_username": "JARVIS_SHEVA_bot",
    "bot_token": "7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8",
    "active": true
  }'
```

## Проверка работы

После обновления:

1. **Проверьте бота в Telegram:**
   - Откройте [@JARVIS_SHEVA_bot](https://t.me/JARVIS_SHEVA_bot)
   - Отправьте `/start`
   - Бот должен ответить

2. **Проверьте уведомления:**
   - Создайте тестовый заказ
   - Проверьте канал: https://t.me/+vZtVvSSVltwzYmMy
   - Уведомление должно появиться

3. **Проверьте Web App:**
   - Откройте бота
   - Нажмите на кнопку меню
   - Web App должно открыться

## Устранение неполадок

### Проблема: Не могу подключиться к серверу

**Решение:**
- Проверьте, что сервер доступен: `ping 194.87.0.193`
- Проверьте, что SSH порт открыт (обычно 22)
- Убедитесь, что используете правильный пароль

### Проблема: База данных не найдена

**Решение:**
- Проверьте список баз данных: `mysql -u root -p -e "SHOW DATABASES;"`
- Найдите базу данных проекта по имени
- Проверьте конфигурационные файлы приложения

### Проблема: Таблица не найдена

**Решение:**
- Проверьте структуру базы данных: `SHOW TABLES;`
- Возможно, таблицы имеют другие имена
- Проверьте миграции базы данных

## Безопасность

⚠️ **Важно:**
- После обновления измените пароль root на сервере
- Используйте SSH ключи вместо паролей
- Ограничьте доступ к базе данных
- Регулярно делайте резервные копии

## Дополнительная информация

- [Конфигурация бота](../BOT_CONFIG.md)
- [Инструкции по обновлению](../BOT_UPDATE_INSTRUCTIONS.md)
- [Автоматизация](../AUTOMATION_COMPLETE.md)

