# Makefile для управления Docker-контейнерами

.PHONY: help build up down logs clean dev prod restart

# Помощь
help:
	@echo "Доступные команды:"
	@echo "  build     - Собрать все Docker образы"
	@echo "  up        - Запустить все сервисы в production режиме"
	@echo "  down      - Остановить все сервисы"
	@echo "  logs      - Показать логи всех сервисов"
	@echo "  clean     - Очистить все контейнеры и образы"
	@echo "  dev       - Запустить в режиме разработки"
	@echo "  prod      - Запустить в production режиме"
	@echo "  restart   - Перезапустить все сервисы"

# Сборка образов
build:
	docker-compose build

# Запуск в production режиме
up:
	docker-compose up -d

# Остановка сервисов
down:
	docker-compose down

# Просмотр логов
logs:
	docker-compose logs -f

# Очистка
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f

# Режим разработки
dev:
	docker-compose -f docker-compose.dev.yml up -d

# Production режим
prod: build up

# Перезапуск
restart:
	docker-compose restart

# Остановка dev среды
dev-down:
	docker-compose -f docker-compose.dev.yml down

# Логи dev среды
dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f
