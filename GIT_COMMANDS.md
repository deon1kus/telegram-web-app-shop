# Команды Git для завершения сохранения v001

## Если Git установлен локально:

```bash
cd D:\WebApp\telegram-web-app-shop-local

# Инициализировать репозиторий (если еще не инициализирован)
git init

# Настроить пользователя
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Добавить все файлы
git add .

# Проверить что будет закоммичено
git status

# Создать коммит
git commit -m "feat: рабочая версия v001 - полностью переведена на русский, исправлены все ошибки"

# Создать тег
git tag v001

# Если есть remote репозиторий
git remote add origin <your-repo-url>
git push -u origin main
git push origin v001
```

## Если Git не установлен, но есть доступ к серверу:

Выполните на сервере после копирования файлов:

```bash
cd /root/telegram-web-app-shop

# Инициализировать репозиторий
git init

# Настроить пользователя
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Добавить все файлы
git add .

# Создать коммит
git commit -m "feat: рабочая версия v001 - полностью переведена на русский, исправлены все ошибки"

# Создать тег
git tag v001

# Если есть remote репозиторий
git remote add origin <your-repo-url>
git push -u origin main
git push origin v001
```

## Альтернатива: Использовать GitHub Desktop

1. Установите GitHub Desktop
2. Откройте папку `D:\WebApp\telegram-web-app-shop-local`
3. Создайте коммит через интерфейс
4. Создайте тег v001

