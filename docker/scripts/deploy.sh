#!/bin/bash

# Workflow Builder Application Deployment Script
# Usage: ./scripts/deploy.sh [environment] [method]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
METHOD="docker"
NAMESPACE="workflow-builder"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [environment] [method]"
    echo ""
    echo "Environments:"
    echo "  dev      - Development environment"
    echo "  staging  - Staging environment"
    echo "  prod     - Production environment"
    echo ""
    echo "Methods:"
    echo "  docker   - Deploy using Docker Compose"
    echo "  k8s      - Deploy using Kubernetes manifests"
    echo "  helm     - Deploy using Helm charts"
    echo ""
    echo "Examples:"
    echo "  $0 dev docker"
    echo "  $0 prod helm"
    echo "  $0 staging k8s"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    case $METHOD in
        "docker")
            if ! command -v docker &> /dev/null; then
                print_error "Docker is not installed"
                exit 1
            fi
            if ! command -v docker-compose &> /dev/null; then
                print_error "Docker Compose is not installed"
                exit 1
            fi
            ;;
        "k8s")
            if ! command -v kubectl &> /dev/null; then
                print_error "kubectl is not installed"
                exit 1
            fi
            ;;
        "helm")
            if ! command -v kubectl &> /dev/null; then
                print_error "kubectl is not installed"
                exit 1
            fi
            if ! command -v helm &> /dev/null; then
                print_error "Helm is not installed"
                exit 1
            fi
            ;;
    esac
    
    print_success "Prerequisites check passed"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Build images
    print_status "Building Docker images..."
    docker build -f backend.Dockerfile -t workflow-backend:latest ../backend
    docker build -f frontend.Dockerfile -t workflow-frontend:latest ../frontend
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service status
    print_status "Checking service status..."
    docker-compose ps
    
    print_success "Docker deployment completed"
    print_status "Access the application at:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend: http://localhost:8000"
    print_status "  API Docs: http://localhost:8000/docs"
}

# Function to deploy with Kubernetes
deploy_k8s() {
    print_status "Deploying with Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE-$ENVIRONMENT --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy based on environment
    case $ENVIRONMENT in
        "dev")
            kubectl apply -k k8s/overlays/dev/
            ;;
        "staging")
            kubectl apply -k k8s/overlays/staging/
            ;;
        "prod")
            kubectl apply -k k8s/overlays/prod/
            ;;
    esac
    
    # Wait for deployments
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/backend -n $NAMESPACE-$ENVIRONMENT
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n $NAMESPACE-$ENVIRONMENT
    
    # Show status
    print_status "Deployment status:"
    kubectl get pods -n $NAMESPACE-$ENVIRONMENT
    kubectl get services -n $NAMESPACE-$ENVIRONMENT
    
    print_success "Kubernetes deployment completed"
}

# Function to deploy with Helm
deploy_helm() {
    print_status "Deploying with Helm..."
    
    # Update dependencies
    print_status "Updating Helm dependencies..."
    cd helm/workflow-builder
    helm dependency update
    cd ../..
    
    # Deploy based on environment
    case $ENVIRONMENT in
        "dev")
            helm install workflow-dev ./helm/workflow-builder \
                --namespace $NAMESPACE-dev \
                --create-namespace \
                --set backend.replicaCount=1 \
                --set frontend.replicaCount=1 \
                --set postgresql.enabled=true \
                --set redis.enabled=true \
                --set chromadb.enabled=true
            ;;
        "staging")
            helm install workflow-staging ./helm/workflow-builder \
                --namespace $NAMESPACE-staging \
                --create-namespace \
                --set backend.replicaCount=2 \
                --set frontend.replicaCount=2 \
                --set postgresql.enabled=true \
                --set redis.enabled=true \
                --set chromadb.enabled=true
            ;;
        "prod")
            helm install workflow-prod ./helm/workflow-builder \
                --namespace $NAMESPACE-prod \
                --create-namespace \
                --set backend.replicaCount=3 \
                --set frontend.replicaCount=3 \
                --set postgresql.enabled=true \
                --set redis.enabled=true \
                --set chromadb.enabled=true \
                --set ingress.enabled=true \
                --set autoscaling.enabled=true
            ;;
    esac
    
    # Wait for deployments
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/workflow-$ENVIRONMENT-backend -n $NAMESPACE-$ENVIRONMENT
    kubectl wait --for=condition=available --timeout=300s deployment/workflow-$ENVIRONMENT-frontend -n $NAMESPACE-$ENVIRONMENT
    
    # Show status
    print_status "Deployment status:"
    kubectl get pods -n $NAMESPACE-$ENVIRONMENT
    kubectl get services -n $NAMESPACE-$ENVIRONMENT
    
    print_success "Helm deployment completed"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    case $METHOD in
        "docker")
            docker-compose down
            ;;
        "k8s")
            kubectl delete -k k8s/base/ || true
            ;;
        "helm")
            helm uninstall workflow-$ENVIRONMENT -n $NAMESPACE-$ENVIRONMENT || true
            ;;
    esac
    
    print_success "Cleanup completed"
}

# Main function
main() {
    # Parse arguments
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    if [ $# -ge 1 ]; then
        ENVIRONMENT=$1
    fi
    
    if [ $# -ge 2 ]; then
        METHOD=$2
    fi
    
    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        print_error "Invalid environment: $ENVIRONMENT"
        show_usage
        exit 1
    fi
    
    # Validate method
    if [[ ! "$METHOD" =~ ^(docker|k8s|helm)$ ]]; then
        print_error "Invalid method: $METHOD"
        show_usage
        exit 1
    fi
    
    print_status "Starting deployment..."
    print_status "Environment: $ENVIRONMENT"
    print_status "Method: $METHOD"
    
    # Check prerequisites
    check_prerequisites
    
    # Deploy based on method
    case $METHOD in
        "docker")
            deploy_docker
            ;;
        "k8s")
            deploy_k8s
            ;;
        "helm")
            deploy_helm
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Handle script interruption
trap cleanup INT TERM

# Run main function
main "$@"