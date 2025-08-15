# 🤖 DeepChatAI

![DeepChatAI Banner](https://img.shields.io/badge/DeepChatAI-AI%20Assistant-blue?style=for-the-badge&logo=openai)
<img width="1703" height="874" alt="Снимок экрана 2025-08-15 в 11 58 27" src="https://github.com/user-attachments/assets/6fe7312a-ff99-4982-a4d4-a9f7da0c2937" />

**DeepChatAI** — это современное веб-приложение для чата с искусственным интеллектом, построенное на архитектуре микросервисов. Приложение предоставляет интуитивный интерфейс для общения с AI-помощником, поддерживает векторный поиск по документам и обеспечивает безопасную аутентификацию пользователей.

## 🌟 Особенности

### 🔥 Основной функционал
- **Интеллектуальный чат** с использованием OpenAI GPT-4o-mini
- **Реал-тайм общение** через WebSocket соединения
- **Векторный поиск** по документам с использованием FAISS
- **Многопользовательская система** с безопасной аутентификацией
- **История чатов** с возможностью создания новых диалогов
- **Современный UI** с адаптивным дизайном

### 🛡️ Безопасность
- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- CORS настройки для безопасного взаимодействия frontend-backend
- Валидация данных с использованием Pydantic

### 🚀 Технологии

#### Backend
- **FastAPI** — современный, быстрый веб-фреймворк для API
- **Tortoise ORM** — асинхронная ORM для работы с базой данных
- **PostgreSQL** — надежная реляционная база данных
- **LangChain** — фреймворк для работы с LLM
- **FAISS** — библиотека для эффективного векторного поиска
- **Redis** — кеширование и сессии (опционально)

#### Frontend
- **React 18** — современная библиотека для создания пользовательских интерфейсов
- **TypeScript** — типизированный JavaScript для надежности
- **Tailwind CSS** — утилитарный CSS фреймворк
- **Vite** — быстрый сборщик и dev-сервер
- **Radix UI** — компоненты для создания доступного интерфейса

#### DevOps
- **Docker & Docker Compose** — контейнеризация приложения
- **Nginx** — веб-сервер для production
- **Poetry** — управление зависимостями Python
- **Makefile** — автоматизация команд

## 📋 Требования

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 18 (для локальной разработки)
- **Python** >= 3.9 (для локальной разработки)
- **OpenAI API ключ**

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/DeepChatAI.git
cd DeepChatAI
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `env.example`:

```bash
cp env.example .env
```

Обязательно заполните в `.env` файле:

```env
# OpenAI API ключ (обязательно!)
OPENAI_API_KEY=your-openai-api-key-here

# Секретный ключ для JWT (измените в продакшене!)
SECRET_KEY=your-super-secret-key-change-in-production

# База данных
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deepchatai

# Остальные настройки можно оставить по умолчанию
```

### 3. Запуск приложения

#### Способ 1: Docker Compose (рекомендуется)

```bash
# Сборка и запуск всех сервисов
make build
make up

# Или одной командой для production
make prod
```

#### Способ 2: Режим разработки

```bash
# Запуск в development режиме
make dev
```

### 4. Доступ к приложению

После успешного запуска приложение будет доступно по адресам:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API документация**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🛠️ Команды управления

Для удобства управления проектом используйте Makefile:

```bash
# Показать все доступные команды
make help

# Основные команды
make build          # Собрать все Docker образы
make up             # Запустить в production режиме
make dev            # Запустить в режиме разработки
make down           # Остановить все сервисы
make logs           # Показать логи всех сервисов
make restart        # Перезапустить сервисы
make clean          # Очистить контейнеры и образы
```

## 🏗️ Архитектура проекта

```
DeepChatAI/
├── backend/                    # FastAPI backend
│   ├── src/
│   │   ├── core/              # Основные конфигурации
│   │   ├── models/            # SQLAlchemy модели
│   │   ├── routers/           # API маршруты
│   │   ├── schemas/           # Pydantic схемы
│   │   ├── services/          # Бизнес-логика
│   │   └── utils/             # Утилиты (AI агент, векторный поиск)
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                   # React frontend
│   ├── components/            # React компоненты
│   ├── lib/                   # Утилиты и API клиент
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # Production конфигурация
├── docker-compose.dev.yml     # Development конфигурация
└── Makefile                   # Команды управления
```

## 🔧 Локальная разработка

### Backend

```bash
cd backend

# Установка зависимостей
poetry install

# Активация виртуального окружения
poetry shell

# Запуск сервера разработки
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev
```

## 📡 API Документация

Backend предоставляет RESTful API с автоматической документацией:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Основные эндпоинты:

- `POST /auth/register` — Регистрация пользователя
- `POST /auth/login` — Авторизация
- `GET /chats/` — Получение списка чатов
- `POST /chats/` — Создание нового чата
- `WebSocket /ws/{chat_id}` — Реал-тайм чат

## 🔌 WebSocket API

Приложение использует WebSocket для реал-тайм общения:

### Подключение
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/${chatId}?token=${accessToken}`);
```

### Формат сообщений

**Отправка сообщения:**
```json
{
  "type": "user_message",
  "message": "Привет! Как дела?"
}
```

**Получение ответа AI:**
```json
{
  "type": "ai_response",
  "message": "Привет! У меня всё отлично, спасибо!",
  "message_id": 123,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🧪 Тестирование

### Backend тесты

```bash
cd backend
poetry run pytest
```

### Frontend тесты

```bash
cd frontend
npm run test
```

## 📦 Сборка для продакшена

### Docker образы

```bash
# Сборка всех образов
docker-compose build

# Сборка конкретного сервиса
docker-compose build backend
docker-compose build frontend
```

### Оптимизация

1. **Backend**: Приложение использует uvicorn с gunicorn для продакшена
2. **Frontend**: Vite собирает оптимизированный bundle
3. **Nginx**: Настроен для эффективной отдачи статики
4. **PostgreSQL**: Использует индексы для быстрых запросов

## 🔧 Настройка

### Переменные окружения

Полный список переменных окружения в файле `env.example`:

```env
# База данных
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/deepchatai

# Безопасность
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# Настройки приложения
DEBUG=false
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3000

# Redis (опционально)
REDIS_URL=redis://localhost:6379
```

### Конфигурация AI

Настройки AI агента можно изменить в файле `backend/src/utils/agent.py`:

- Модель OpenAI (по умолчанию: gpt-4o-mini)
- Температура генерации (по умолчанию: 0.7)
- Промпт системы
- Инструменты для агента

## 🚨 Troubleshooting

### Частые проблемы

1. **Ошибка подключения к базе данных**
   ```bash
   # Проверьте статус PostgreSQL
   docker-compose logs postgres
   ```

2. **OpenAI API ошибки**
   - Убедитесь, что API ключ правильный
   - Проверьте баланс на счету OpenAI
   - Убедитесь в доступности модели gpt-4o-mini

3. **Frontend не загружается**
   ```bash
   # Пересоберите frontend
   docker-compose build frontend
   docker-compose up -d frontend
   ```

4. **WebSocket соединение не работает**
   - Проверьте CORS настройки
   - Убедитесь, что JWT токен валидный
   - Проверьте логи backend сервиса

### Логи

```bash
# Логи всех сервисов
make logs

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Стиль кода

- **Backend**: Используйте black для форматирования, flake8 для линтинга
- **Frontend**: Используйте ESLint и Prettier
- **Commit messages**: Используйте conventional commits

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 🙏 Благодарности

- [OpenAI](https://openai.com/) за предоставление API
- [FastAPI](https://fastapi.tiangolo.com/) за отличный фреймворк
- [React](https://reactjs.org/) за мощную библиотеку UI
- [LangChain](https://langchain.com/) за инструменты работы с LLM

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [FAQ](#-troubleshooting) выше
2. Создайте issue в GitHub
3. Напишите на email: support@deepchatai.com

---

**DeepChatAI** — делаем общение с искусственным интеллектом простым и эффективным! 🚀
