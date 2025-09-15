# Makefile for Workflow Builder Application

.PHONY: help build run stop clean test lint docker-build docker-run k8s-deploy k8s-delete helm-install helm-uninstall

# Default target
help: ## Show this help message
	@echo "Workflow Builder Application - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install dependencies
	@echo "Installing backend dependencies..."
	cd ../backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd ../frontend && npm install

run-dev: ## Run development environment
	@echo "Starting development environment..."
	docker-compose up -d

run-backend: ## Run backend only
	@echo "Starting backend..."
	cd ../backend && python main.py

run-frontend: ## Run frontend only
	@echo "Starting frontend..."
	cd ../frontend && npm start

# Docker Commands
docker-build: ## Build Docker images
	@echo "Building backend image..."
	docker build -f backend.Dockerfile -t workflow-backend:latest ../backend
	@echo "Building frontend image..."
	docker build -f frontend.Dockerfile -t workflow-frontend:latest ../frontend

docker-run: ## Run with Docker Compose
	@echo "Starting services with Docker Compose..."
	docker-compose up -d

docker-stop: ## Stop Docker Compose services
	@echo "Stopping Docker Compose services..."
	docker-compose down

docker-clean: ## Clean Docker resources
	@echo "Cleaning Docker resources..."
	docker-compose down -v
	docker system prune -f

# Testing Commands
test: ## Run tests
	@echo "Running backend tests..."
	cd ../backend && python -m pytest tests/ -v
	@echo "Running frontend tests..."
	cd ../frontend && npm test -- --coverage --watchAll=false

test-backend: ## Run backend tests only
	@echo "Running backend tests..."
	cd ../backend && python -m pytest tests/ -v

test-frontend: ## Run frontend tests only
	@echo "Running frontend tests..."
	cd ../frontend && npm test -- --coverage --watchAll=false

# Linting Commands
lint: ## Run linting
	@echo "Linting backend..."
	cd ../backend && flake8 . --max-line-length=88
	@echo "Linting frontend..."
	cd ../frontend && npm run lint

lint-fix: ## Fix linting issues
	@echo "Fixing backend linting..."
	cd ../backend && black . --line-length=88
	@echo "Fixing frontend linting..."
	cd ../frontend && npm run lint:fix

# Kubernetes Commands
k8s-deploy-dev: ## Deploy to Kubernetes (development)
	@echo "Deploying to Kubernetes (development)..."
	kubectl apply -k k8s/overlays/dev/

k8s-deploy-prod: ## Deploy to Kubernetes (production)
	@echo "Deploying to Kubernetes (production)..."
	kubectl apply -k k8s/overlays/prod/

k8s-delete: ## Delete Kubernetes resources
	@echo "Deleting Kubernetes resources..."
	kubectl delete -k k8s/base/

k8s-status: ## Check Kubernetes status
	@echo "Checking Kubernetes status..."
	kubectl get pods -n workflow-builder
	kubectl get services -n workflow-builder
	kubectl get ingress -n workflow-builder

# Helm Commands
helm-install-dev: ## Install with Helm (development)
	@echo "Installing with Helm (development)..."
	helm install workflow-dev ./helm/workflow-builder \
		--namespace workflow-builder-dev \
		--create-namespace \
		--set backend.replicaCount=1 \
		--set frontend.replicaCount=1

helm-install-prod: ## Install with Helm (production)
	@echo "Installing with Helm (production)..."
	helm install workflow-prod ./helm/workflow-builder \
		--namespace workflow-builder-prod \
		--create-namespace \
		--set backend.replicaCount=3 \
		--set frontend.replicaCount=3 \
		--set ingress.enabled=true \
		--set autoscaling.enabled=true

helm-uninstall: ## Uninstall Helm releases
	@echo "Uninstalling Helm releases..."
	helm uninstall workflow-dev -n workflow-builder-dev || true
	helm uninstall workflow-prod -n workflow-builder-prod || true

helm-status: ## Check Helm status
	@echo "Checking Helm status..."
	helm list -A

# Utility Commands
logs: ## View logs
	@echo "Viewing logs..."
	docker-compose logs -f

logs-backend: ## View backend logs
	@echo "Viewing backend logs..."
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	@echo "Viewing frontend logs..."
	docker-compose logs -f frontend

clean: ## Clean up resources
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f
	cd frontend && rm -rf node_modules
	cd backend && find . -type d -name "__pycache__" -exec rm -rf {} + || true

# Database Commands
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	cd backend && python -m alembic upgrade head

db-reset: ## Reset database
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	sleep 10
	make db-migrate

# Security Commands
security-scan: ## Run security scans
	@echo "Running security scans..."
	cd backend && safety check
	cd frontend && npm audit

# Backup Commands
backup-db: ## Backup database
	@echo "Backing up database..."
	docker-compose exec postgres pg_dump -U workflow_user workflow_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database (usage: make restore-db FILE=backup.sql)
	@echo "Restoring database from $(FILE)..."
	docker-compose exec -T postgres psql -U workflow_user workflow_db < $(FILE)

# Monitoring Commands
monitor: ## Monitor application
	@echo "Monitoring application..."
	docker-compose ps
	docker stats --no-stream

# Setup Commands
setup-dev: ## Setup development environment
	@echo "Setting up development environment..."
	make install
	cp .env.example .env
	docker-compose up -d postgres chromadb redis
	sleep 10
	make db-migrate
	@echo "Development environment ready!"

setup-prod: ## Setup production environment
	@echo "Setting up production environment..."
	make docker-build
	make helm-install-prod
	@echo "Production environment ready!"