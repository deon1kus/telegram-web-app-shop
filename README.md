# Telegram Web App Shop

Веб-приложение интернет-магазина для Telegram, построенное на React + TypeScript + Vite.

## 📋 Описание

Этот проект представляет собой полнофункциональный интернет-магазин, интегрированный с Telegram Web App API. Приложение поддерживает просмотр товаров, категорий, корзину, оформление заказов и админ-панель.

## 🛠️ Технологии

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **UI Framework**: Ant Design
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Styling**: TailwindCSS, SCSS
- **API Client**: Axios

## 📦 Установка

### Требования

- Node.js 18+ или выше
- pnpm (рекомендуется) или npm
- Доступ к серверу с Node.js для деплоя

### Локальная установка

1. **Клонировать репозиторий:**
   ```bash
   git clone <repository-url>
   cd telegram-web-app-shop-local
   ```

2. **Установить зависимости:**
   ```bash
   pnpm install
   # или
   npm install
   ```

3. **Создать файл `.env` в корне проекта:**
   ```env
   VITE_API_URL=https://your-api-server.com
   ```

4. **Запустить dev сервер:**
   ```bash
   pnpm dev
   # или
   npm run dev
   ```

5. **Открыть в браузере:**
   ```
   http://localhost:3000
   ```

## 🚀 Деплой на сервер

### Подготовка сервера

1. **Установить Node.js и pnpm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pnpm
   ```

2. **Установить Nginx:**
   ```bash
   sudo apt update
   sudo apt install -y nginx
   ```

3. **Настроить SSL (опционально):**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Деплой приложения

1. **Скопировать файлы на сервер:**
   ```bash
   # Используя SCP
   scp -r dist/* user@server:/root/telegram-web-app-shop/dist/
   
   # Или используя FileZilla/SFTP
   ```

2. **Собрать проект на сервере:**
   ```bash
   cd /root/telegram-web-app-shop
   pnpm install
   pnpm build
   ```

3. **Настроить Nginx:**
   
   Создать файл `/etc/nginx/sites-available/telegram-shop`:
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # Frontend
       location / {
           root /root/telegram-web-app-shop/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # API Proxy
       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

4. **Активировать конфигурацию:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/telegram-shop /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## ⚠️ Важные замечания и решения проблем

### Проблема: "Cannot read properties of undefined (reading 'map')"

**Решение:**
- Убедитесь, что API возвращает данные в правильном формате
- Все использования `.map()` должны иметь проверку: `Array.isArray(data) && data.map(...)`
- В компоненте `list.tsx` используется: `const products = Array.isArray(data?.products) ? data.products : [];`

### Проблема: "h is not a function" или "d is not a function"

**Решение:**
- Не используйте `defaultCurrent` в Pagination, используйте `current`
- Не используйте `defaultValue` в Select, используйте только `value`
- Убедитесь, что все обработчики событий проверяют `isMounted` перед вызовом

### Проблема: "products is not defined"

**Решение:**
- Всегда инициализируйте переменную `products` перед использованием
- Используйте: `const products = Array.isArray(data?.products) ? data.products : [];`

### Проблема: Nginx возвращает HTML вместо JSON для API

**Решение:**
- Убедитесь, что `location /api/` находится **ПЕРЕД** `location /` в конфигурации Nginx
- Проверьте, что `proxy_pass` указывает на правильный порт (обычно 3001)

### Проблема: Ошибка при добавлении в корзину "неверный ID товара"

**Решение:**
- Используйте `data?.product_Id` из загруженных данных товара вместо `product_id` из URL
- Проверьте правильность преобразования типов: `const productIdNum = typeof product_id === 'string' ? parseInt(product_id, 10) : Number(product_id);`

### Проблема: Персидские тексты в интерфейсе

**Решение:**
- Все тексты должны быть переведены на русский язык
- Проверьте файлы в `src/components/` и `src/pages/` на наличие персидских символов

## 📁 Структура проекта

```
telegram-web-app-shop-local/
├── src/
│   ├── components/      # Переиспользуемые компоненты
│   ├── containers/      # Контейнеры (высокоуровневые компоненты)
│   ├── framework/       # API клиент и типы
│   ├── pages/          # Страницы приложения
│   ├── helpers/        # Вспомогательные функции
│   └── styles/         # Стили (SCSS/CSS)
├── public/             # Статические файлы
├── package.json        # Зависимости
├── vite.config.ts      # Конфигурация Vite
└── tsconfig.json       # Конфигурация TypeScript
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=https://your-api-server.com
```

### API Configuration

API клиент настроен в `src/framework/api/utils/api-config.ts`:
- Базовый URL берется из `VITE_API_URL`
- Все запросы идут на `/api/*`

## 📝 Скрипты

- `pnpm dev` - Запуск dev сервера
- `pnpm build` - Сборка для продакшена
- `pnpm preview` - Предпросмотр собранного проекта
- `pnpm lint:eslint` - Проверка кода ESLint
- `pnpm fix:eslint` - Автоисправление ESLint

## 🐛 Отладка

### Проверка API

```bash
# Проверить доступность API
curl -k https://your-server.com/api/products

# Должен вернуть JSON, а не HTML
```

### Логи на сервере

```bash
# Логи Nginx
sudo tail -f /var/log/nginx/error.log

# Логи приложения (если используется PM2)
pm2 logs
```

## 📄 Лицензия

[Указать лицензию]

## 👥 Авторы

[Указать авторов]

## 🔗 Ссылки

- [Telegram Web App API](https://core.telegram.org/bots/webapps)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Ant Design](https://ant.design)
