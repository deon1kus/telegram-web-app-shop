#!/bin/bash
# Быстрое обновление настроек бота на сервере
# Запустите на сервере: bash quick-update.sh

echo "=== Обновление настроек Telegram бота ==="
echo ""

# Настройки
BOT_USERNAME="JARVIS_SHEVA_bot"
BOT_TOKEN="7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8"
CHANNEL_CHAT_ID="-1003018207910"
CHANNEL_LINK="https://t.me/+vZtVvSSVltwzYmMy"

# Поиск базы данных
echo "Поиск базы данных..."

# Попытка найти конфигурацию приложения
if [ -f "/var/www/html/.env" ]; then
    DB_NAME=$(grep DB_DATABASE /var/www/html/.env | cut -d'=' -f2 | tr -d ' ')
    DB_USER=$(grep DB_USERNAME /var/www/html/.env | cut -d'=' -f2 | tr -d ' ')
    DB_PASS=$(grep DB_PASSWORD /var/www/html/.env | cut -d'=' -f2 | tr -d ' ')
    echo "Найдена конфигурация: $DB_NAME"
elif [ -f "/root/.env" ]; then
    DB_NAME=$(grep DB_DATABASE /root/.env | cut -d'=' -f2 | tr -d ' ')
    DB_USER=$(grep DB_USERNAME /root/.env | cut -d'=' -f2 | tr -d ' ')
    DB_PASS=$(grep DB_PASSWORD /root/.env | cut -d'=' -f2 | tr -d ' ')
    echo "Найдена конфигурация: $DB_NAME"
else
    echo "Конфигурация не найдена. Введите данные вручную:"
    read -p "Имя базы данных: " DB_NAME
    read -p "Пользователь БД: " DB_USER
    read -s -p "Пароль БД: " DB_PASS
    echo ""
fi

# Обновление через MySQL
if command -v mysql &> /dev/null; then
    echo ""
    echo "Обновление через MySQL..."
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
UPDATE bot_settings 
SET bot_username = '$BOT_USERNAME', bot_token = '$BOT_TOKEN', active = 1
WHERE bot_username = '$BOT_USERNAME' OR bot_username LIKE '%JARVIS%';

UPDATE notification_settings 
SET channel_chat_id = '$CHANNEL_CHAT_ID', channel_link = '$CHANNEL_LINK'
WHERE channel_name LIKE '%Notifications%' OR channel_name LIKE '%Уведомления%';

SELECT 'Bot settings updated' as status;
EOF
    echo "✅ Обновление завершено!"
fi

# Обновление через PostgreSQL
if command -v psql &> /dev/null; then
    echo ""
    echo "Обновление через PostgreSQL..."
    export PGPASSWORD="$DB_PASS"
    psql -U "$DB_USER" -d "$DB_NAME" <<EOF
UPDATE bot_settings 
SET bot_username = '$BOT_USERNAME', bot_token = '$BOT_TOKEN', active = true
WHERE bot_username = '$BOT_USERNAME' OR bot_username LIKE '%JARVIS%';

UPDATE notification_settings 
SET channel_chat_id = '$CHANNEL_CHAT_ID', channel_link = '$CHANNEL_LINK'
WHERE channel_name LIKE '%Notifications%' OR channel_name LIKE '%Уведомления%';
EOF
    echo "✅ Обновление завершено!"
fi

echo ""
echo "Проверьте работу бота в Telegram!"

