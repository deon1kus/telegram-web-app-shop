-- SQL скрипт для обновления базы данных для поддержки Telegram канала
-- Выполнить на сервере после создания файлов webhook

-- Добавление полей для связи с Telegram
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_sequence_id INT UNIQUE COMMENT 'Последовательный ID товара для канала',
ADD COLUMN IF NOT EXISTS telegram_message_id BIGINT UNIQUE COMMENT 'ID сообщения в Telegram канале',
ADD COLUMN IF NOT EXISTS telegram_channel_id BIGINT COMMENT 'ID канала Telegram',
ADD COLUMN IF NOT EXISTS sync_status ENUM('synced', 'pending', 'error') DEFAULT 'synced' COMMENT 'Статус синхронизации';

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_product_sequence_id ON products(product_sequence_id);
CREATE INDEX IF NOT EXISTS idx_telegram_message_id ON products(telegram_message_id);
CREATE INDEX IF NOT EXISTS idx_telegram_channel_id ON products(telegram_channel_id);

-- Создание таблицы счетчиков для последовательных ID (опционально)
-- Используйте если не хотите использовать AUTO_INCREMENT
CREATE TABLE IF NOT EXISTS product_counters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  last_product_id INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Инициализация счетчика
INSERT INTO product_counters (last_product_id) VALUES (0)
ON DUPLICATE KEY UPDATE last_product_id = last_product_id;

-- Проверка структуры таблицы
DESCRIBE products;

-- Проверка индексов
SHOW INDEXES FROM products WHERE Key_name LIKE '%telegram%' OR Key_name LIKE '%sequence%';

