# Stockly Docker Makefile
# Usage: make [command]

.PHONY: help build up down restart logs shell artisan composer npm test migrate fresh seed

# Default target
help:
	@echo "Stockly Docker Commands:"
	@echo ""
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start all containers"
	@echo "  make down       - Stop all containers"
	@echo "  make restart    - Restart all containers"
	@echo "  make logs       - View container logs"
	@echo ""
	@echo "  make shell      - Open bash in workspace container"
	@echo "  make artisan    - Run artisan command (e.g., make artisan cmd='migrate')"
	@echo "  make composer   - Run composer command (e.g., make composer cmd='install')"
	@echo "  make npm        - Run npm command (e.g., make npm cmd='install')"
	@echo ""
	@echo "  make install    - Initial setup (composer, npm, migrate)"
	@echo "  make dev        - Start Vite dev server"
	@echo "  make test       - Run PHPUnit tests"
	@echo "  make migrate    - Run database migrations"
	@echo "  make fresh      - Fresh migration with seeds"
	@echo "  make seed       - Run database seeders"
	@echo "  make pint       - Run Laravel Pint formatter"
	@echo ""

# Build Docker images
build:
	docker compose build

# Start all containers in detached mode
up:
	docker compose up -d

# Stop all containers
down:
	docker compose down

# Restart containers
restart:
	docker compose restart

# View logs
logs:
	docker compose logs -f

# Open shell in workspace
shell:
	docker compose exec workspace bash

# Run artisan command
artisan:
	docker compose exec workspace php artisan $(cmd)

# Run composer command
composer:
	docker compose exec workspace composer $(cmd)

# Run npm command
npm:
	docker compose exec workspace bash -c "source ~/.nvm/nvm.sh && npm $(cmd)"

# Initial setup
install:
	docker compose exec workspace composer install
	docker compose exec workspace bash -c "source ~/.nvm/nvm.sh && npm install"
	docker compose exec workspace php artisan key:generate
	docker compose exec workspace php artisan migrate
	@echo "Setup complete! Run 'make dev' to start development server."

# Start Vite development server
dev:
	docker compose exec workspace bash -c "source ~/.nvm/nvm.sh && npm run dev -- --host 0.0.0.0"

# Run tests
test:
	docker compose exec workspace php artisan test

# Run migrations
migrate:
	docker compose exec workspace php artisan migrate

# Fresh migration with seeds
fresh:
	docker compose exec workspace php artisan migrate:fresh --seed

# Run seeders
seed:
	docker compose exec workspace php artisan db:seed

# Run Pint formatter
pint:
	docker compose exec workspace vendor/bin/pint --dirty

# Build for production
build-prod:
	docker compose exec workspace bash -c "source ~/.nvm/nvm.sh && npm run build"

# Clear all caches
clear:
	docker compose exec workspace php artisan config:clear
	docker compose exec workspace php artisan route:clear
	docker compose exec workspace php artisan view:clear
	docker compose exec workspace php artisan cache:clear
