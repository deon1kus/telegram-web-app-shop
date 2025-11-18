-- SQL скрипт для обновления настроек Telegram бота
-- Использование: mysql -u root -p database_name < update-bot-sql.sql
-- Или: psql -U postgres -d database_name -f update-bot-sql.sql

-- Настройки бота
SET @bot_username = 'JARVIS_SHEVA_bot';
SET @bot_token = '7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8';
SET @channel_chat_id = '-1003018207910';
SET @channel_link = 'https://t.me/+vZtVvSSVltwzYmMy';

-- Обновление настроек бота
UPDATE bot_settings 
SET 
  bot_username = @bot_username,
  bot_token = @bot_token,
  active = 1
WHERE bot_username = @bot_username
   OR bot_username LIKE '%JARVIS%'
   OR id = (SELECT MIN(id) FROM bot_settings);

-- Обновление настроек канала для уведомлений
UPDATE notification_settings 
SET 
  channel_chat_id = @channel_chat_id,
  channel_link = @channel_link
WHERE channel_name LIKE '%Notifications%' 
   OR channel_name LIKE '%Уведомления%'
   OR channel_name LIKE '%магазина%';

-- Проверка обновленных данных
SELECT 
  id,
  bot_username,
  SUBSTRING(bot_token, 1, 10) as token_preview,
  active,
  shop_name
FROM bot_settings 
WHERE bot_username = @bot_username;

-- Проверка настроек канала
SELECT 
  id,
  channel_name,
  channel_chat_id,
  channel_link
FROM notification_settings 
WHERE channel_chat_id = @channel_chat_id;

