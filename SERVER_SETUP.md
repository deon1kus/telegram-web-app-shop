# Инструкция по настройке на сервере

## Проблема: "Could not read package.json"

Эта ошибка означает, что вы находитесь не в директории проекта.

## Решение

### Шаг 1: Найдите директорию проекта

Выполните на сервере:

```bash
# Вариант 1: Поиск по имени
find /root -name "package.json" -type f 2>/dev/null | grep telegram

# Вариант 2: Поиск всех package.json
find /root -name "package.json" -type f 2>/dev/null

# Вариант 3: Список директорий
ls -la /root/ | grep telegram
```

### Шаг 2: Перейдите в директорию проекта

После того как найдете директорию, перейдите в неё:

```bash
cd /root/telegram-web-app-shop-local
# или
cd /root/telegram-web-app-shop
# или другая директория, где находится проект
```

### Шаг 3: Проверьте наличие файлов

Убедитесь, что вы в правильной директории:

```bash
ls -la
# Должны быть видны: package.json, src/, public/, vite.config.ts и т.д.
```

### Шаг 4: Установите зависимости

Если `node_modules` отсутствует:

```bash
npm install
# или
pnpm install
```

### Шаг 5: Создайте файл .env

```bash
nano .env
# или
vi .env
```

Добавьте:
```env
VITE_API_URL=https://your-api-server.com
```

Сохраните (в nano: Ctrl+O, Enter, Ctrl+X; в vi: Esc, :wq, Enter)

### Шаг 6: Запустите dev сервер

```bash
npm run dev
```

## Если проект еще не на сервере

Если проект еще не загружен на сервер, нужно:

### Вариант 1: Клонировать с GitHub

```bash
cd /root
git clone https://github.com/deon1kus/telegram-web-app-shop.git
cd telegram-web-app-shop
npm install
```

### Вариант 2: Загрузить файлы через SCP/SFTP

С локального компьютера:

```bash
scp -r D:\WebApp\telegram-web-app-shop-local\* root@your-server:/root/telegram-web-app-shop/
```

Или используйте FileZilla/WinSCP для загрузки файлов.

## Для продакшена (сборка)

Для продакшена нужно собрать проект:

```bash
# 1. Перейдите в директорию проекта
cd /root/telegram-web-app-shop-local

# 2. Установите зависимости (если еще не установлены)
npm install

# 3. Создайте .env файл с продакшен URL
echo "VITE_API_URL=https://your-api-server.com" > .env

# 4. Соберите проект
npm run build

# 5. Файлы будут в директории dist/
ls -la dist/
```

Затем настройте Nginx для раздачи файлов из `dist/`.

## Проверка текущей директории

Всегда проверяйте, где вы находитесь:

```bash
pwd  # Покажет текущую директорию
ls -la  # Покажет файлы в текущей директории
```

## Быстрая команда для поиска проекта

```bash
# Найти все директории с package.json
find /root -name "package.json" -type f 2>/dev/null

# Перейти в найденную директорию
cd $(dirname $(find /root -name "package.json" -type f 2>/dev/null | head -1))
```

