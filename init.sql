-- Создание базы данных для DeepChatAI
-- Этот файл выполняется при первом запуске PostgreSQL контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание схемы по умолчанию (если не существует)
CREATE SCHEMA IF NOT EXISTS public;

-- Настройка прав доступа
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Создание индекса для производительности (будет использоваться ORM)
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
-- CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);

-- Настройка часового пояса
SET timezone = 'UTC';
