# Docker & Kubernetes Deployment

This folder contains all containerization and deployment configurations for the Workflow Builder Application.

## 📁 Folder Structure

```
docker/
├── README.md                    # This file
├── DEPLOYMENT.md               # Comprehensive deployment guide
├── Makefile                    # Build and deployment commands
├── .env.example               # Environment configuration template
├── docker-compose.yml         # Docker Compose configuration
├── backend.Dockerfile         # Backend container configuration
├── frontend.Dockerfile        # Frontend container configuration
├── nginx.conf                 # Nginx configuration for frontend
├── backend.dockerignore       # Backend Docker ignore rules
├── frontend.dockerignore      # Frontend Docker ignore rules
├── k8s/                       # Kubernetes manifests
│   ├── base/                  # Base Kubernetes configurations
│   └── overlays/              # Environment-specific overlays
│       ├── dev/               # Development environment
│       ├── staging/           # Staging environment
│       └── prod/              # Production environment
├── helm/                      # Helm charts
│   └── workflow-builder/      # Main Helm chart
│       ├── Chart.yaml         # Chart metadata
│       ├── values.yaml        # Default values
│       └── templates/         # Kubernetes templates
└── scripts/                   # Deployment scripts
    └── deploy.sh              # Automated deployment script
```

## 🚀 Quick Start

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment
```bash
# Deploy to development
kubectl apply -k k8s/overlays/dev/

# Deploy to production
kubectl apply -k k8s/overlays/prod/
```

### Helm Deployment
```bash
# Install development environment
helm install workflow-dev ./helm/workflow-builder \
  --namespace workflow-builder-dev \
  --create-namespace

# Install production environment
helm install workflow-prod ./helm/workflow-builder \
  --namespace workflow-builder-prod \
  --create-namespace
```

## 🛠️ Available Commands

Use the Makefile for common operations:

```bash
# Show all available commands
make help

# Build Docker images
make docker-build

# Run development environment
make run-dev

# Deploy to Kubernetes
make k8s-deploy-dev
make k8s-deploy-prod

# Deploy with Helm
make helm-install-dev
make helm-install-prod
```

## 📋 Prerequisites

### For Docker
- Docker (version 20.10+)
- Docker Compose (version 2.0+)

### For Kubernetes
- kubectl (version 1.24+)
- Kubernetes cluster (local or cloud)

### For Helm
- Helm (version 3.8+)
- kubectl configured for your cluster

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Docker Compose
The `docker-compose.yml` file configures:
- PostgreSQL database
- ChromaDB vector database
- Redis cache
- Backend API service
- Frontend React application

### Kubernetes Manifests
- **Base manifests**: Core Kubernetes resources
- **Overlays**: Environment-specific configurations
- **Kustomize**: For managing multiple environments

### Helm Charts
- **Chart.yaml**: Chart metadata and dependencies
- **values.yaml**: Configurable parameters
- **Templates**: Kubernetes resource templates

## 🌐 Access Points

### Docker Development
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Kubernetes (with port-forward)
```bash
# Frontend
kubectl port-forward svc/frontend-service 3000:3000 -n workflow-builder

# Backend
kubectl port-forward svc/backend-service 8000:8000 -n workflow-builder
```

## 📚 Documentation

- **DEPLOYMENT.md**: Comprehensive deployment guide
- **README.md**: This overview file
- **Makefile**: Available commands and targets

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000, 8000, 5432, 6379, 8001 are available
2. **Docker build failures**: Ensure Docker daemon is running
3. **Kubernetes connection**: Verify kubectl is configured correctly
4. **Helm installation**: Check Helm version compatibility

### Getting Help

```bash
# View service logs
docker-compose logs [service-name]

# Check Kubernetes status
kubectl get pods -n workflow-builder

# View Helm releases
helm list -A
```

## 🚀 Production Considerations

### Security
- Use secrets management for sensitive data
- Enable TLS/SSL for ingress
- Run containers as non-root users
- Regular security scans

### Monitoring
- Set up health checks
- Configure resource limits
- Monitor application metrics
- Set up logging aggregation

### Scaling
- Use Horizontal Pod Autoscaling
- Configure resource requests/limits
- Consider database scaling strategies
- Implement caching layers

## 📞 Support

For issues or questions:
1. Check the DEPLOYMENT.md guide
2. Review the troubleshooting section
3. Check service logs
4. Verify configuration files