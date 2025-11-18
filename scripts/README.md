# Скрипты автоматизации

## Обновление настроек Telegram бота

### Доступные скрипты

1. **Node.js** (`update-bot-config.js`) - для всех платформ
2. **PowerShell** (`update-bot-config.ps1`) - для Windows
3. **Bash** (`update-bot-config.sh`) - для Linux/macOS

### Использование

#### Node.js (рекомендуется)

```bash
# Установите зависимости (если еще не установлены)
npm install

# Запустите скрипт
npm run update-bot

# Или напрямую
node scripts/update-bot-config.js
```

#### PowerShell (Windows)

```powershell
# Запустите скрипт
npm run update-bot:ps1

# Или напрямую
.\scripts\update-bot-config.ps1
```

#### Bash (Linux/macOS)

```bash
# Сделайте скрипт исполняемым
chmod +x scripts/update-bot-config.sh

# Запустите скрипт
npm run update-bot:sh

# Или напрямую
bash scripts/update-bot-config.sh
```

### Параметры

Все скрипты поддерживают параметры командной строки:

```bash
# Node.js
node scripts/update-bot-config.js --token=YOUR_TOKEN --channel-id=YOUR_CHAT_ID

# PowerShell
.\scripts\update-bot-config.ps1 -BotToken "YOUR_TOKEN" -ChannelChatId "YOUR_CHAT_ID"

# Bash
bash scripts/update-bot-config.sh --bot-token=YOUR_TOKEN --channel-id=YOUR_CHAT_ID
```

### Переменные окружения

Можно использовать переменные окружения:

```bash
# Node.js / Bash
export VITE_API_URL=http://194.87.0.193
export BOT_TOKEN=7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8
export CHANNEL_CHAT_ID=-1003018207910

# PowerShell
$env:VITE_API_URL="http://194.87.0.193"
$env:BOT_TOKEN="7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8"
$env:CHANNEL_CHAT_ID="-1003018207910"
```

### Текущие настройки по умолчанию

- **API URL:** `http://194.87.0.193`
- **Bot Username:** `JARVIS_SHEVA_bot`
- **Bot Token:** `7811866862:AAH4z4mpba_o-fRCdgDv09Ej8nTy-QkzId8`
- **Channel Chat ID:** `-1003018207910`
- **Channel Link:** `https://t.me/+vZtVvSSVltwzYmMy`

### Что делает скрипт

1. ✅ Подключается к API серверу
2. ✅ Получает текущие настройки бота
3. ✅ Обновляет токен и username бота
4. ✅ Активирует бота
5. ✅ Выводит результат обновления

### Требования

- Доступ к API серверу (`http://194.87.0.193`)
- API endpoint `/api/bot-setting` должен быть доступен
- Для Node.js скрипта: `axios` (уже в зависимостях)
- Для Bash скрипта: `curl` и `jq` (установите: `sudo apt-get install curl jq`)

### Устранение неполадок

#### Ошибка подключения к API

```
❌ Ошибка: Не удалось подключиться к API серверу
```

**Решение:**
- Проверьте доступность сервера: `curl http://194.87.0.193/api/bot-setting`
- Проверьте настройки файрвола
- Убедитесь, что сервер запущен

#### Ошибка получения настроек

```
❌ Ошибка: Не удалось получить настройки бота
```

**Решение:**
- Проверьте, что endpoint `/api/bot-setting` существует
- Проверьте логи сервера
- Убедитесь, что API требует аутентификацию (если да, добавьте в скрипт)

#### Ошибка обновления

```
❌ Ошибка: Не удалось обновить настройки
```

**Решение:**
- Проверьте права доступа к API
- Проверьте формат данных
- Проверьте логи сервера

### Безопасность

⚠️ **Важно:**
- Токен бота хранится в скриптах только для удобства
- В продакшене используйте переменные окружения
- Не коммитьте токены в Git (они уже в .gitignore)
- Регулярно проверяйте безопасность токена

### Дополнительная информация

- [Документация бота](../BOT_CONFIG.md)
- [Инструкции по обновлению](../BOT_UPDATE_INSTRUCTIONS.md)

