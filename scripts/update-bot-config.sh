#!/bin/bash
# Bash скрипт для автоматического обновления настроек Telegram бота
# Использование: bash scripts/update-bot-config.sh

# Конфигурация по умолчанию
API_URL="${VITE_API_URL:-http://194.87.0.193}"
BOT_USERNAME="${BOT_USERNAME:-JARVIS_SHEVA_bot}"
BOT_TOKEN="${BOT_TOKEN:-7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8}"
CHANNEL_CHAT_ID="${CHANNEL_CHAT_ID:--1003018207910}"
CHANNEL_LINK="${CHANNEL_LINK:-https://t.me/+vZtVvSSVltwzYmMy}"

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --api-url=*)
            API_URL="${1#*=}"
            shift
            ;;
        --bot-username=*)
            BOT_USERNAME="${1#*=}"
            shift
            ;;
        --bot-token=*)
            BOT_TOKEN="${1#*=}"
            shift
            ;;
        --channel-id=*)
            CHANNEL_CHAT_ID="${1#*=}"
            shift
            ;;
        *)
            echo "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

API_BASE_URL="${API_URL}/api"

echo "🚀 Скрипт обновления настроек Telegram бота"
echo "=================================================="
echo ""
echo "🔄 Обновление настроек бота..."
echo "📡 API URL: $API_BASE_URL"
echo "🤖 Bot: $BOT_USERNAME"
echo "🔑 Token: ${BOT_TOKEN:0:10}..."
echo "📢 Channel Chat ID: $CHANNEL_CHAT_ID"
echo ""

# Получаем текущие настройки
echo "📥 Получение текущих настроек..."
GET_RESPONSE=$(curl -s "${API_BASE_URL}/bot-setting")

if [ $? -ne 0 ]; then
    echo "❌ Ошибка: Не удалось подключиться к API серверу"
    echo "   Проверьте доступность: $API_URL"
    exit 1
fi

BOT_ID=$(echo "$GET_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -z "$BOT_ID" ]; then
    echo "❌ Ошибка: Не удалось получить настройки бота"
    echo "   Ответ сервера: $GET_RESPONSE"
    exit 1
fi

echo "✅ Текущие настройки получены (ID: $BOT_ID)"
echo ""

# Подготавливаем данные для обновления
UPDATE_DATA=$(echo "$GET_RESPONSE" | jq --arg username "$BOT_USERNAME" \
    --arg token "$BOT_TOKEN" \
    '. + {bot_username: $username, bot_token: $token, active: true}')

if [ $? -ne 0 ]; then
    echo "❌ Ошибка: Не удалось подготовить данные для обновления"
    echo "   Убедитесь, что установлен jq: sudo apt-get install jq"
    exit 1
fi

# Обновляем настройки
echo "📤 Отправка обновленных настроек..."
UPDATE_RESPONSE=$(curl -s -X PUT "${API_BASE_URL}/bot-setting/${BOT_ID}" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")

if [ $? -ne 0 ]; then
    echo "❌ Ошибка: Не удалось обновить настройки"
    exit 1
fi

UPDATED_USERNAME=$(echo "$UPDATE_RESPONSE" | grep -o '"bot_username":"[^"]*"' | cut -d'"' -f4)
UPDATED_ACTIVE=$(echo "$UPDATE_RESPONSE" | grep -o '"active":[^,}]*' | grep -o '[^:]*$')

echo "✅ Настройки бота успешно обновлены!"
echo ""
echo "Обновленные данные:"
echo "  - Bot Username: $UPDATED_USERNAME"
echo "  - Bot Token: ${BOT_TOKEN:0:10}..."
echo "  - Active: $([ "$UPDATED_ACTIVE" = "true" ] && echo "✅" || echo "❌")"

echo ""
echo "=================================================="
echo "✅ Обновление завершено успешно!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Проверьте работу бота в Telegram"
echo "   2. Проверьте отправку уведомлений в канал"
echo "   3. Убедитесь, что Web App открывается корректно"

