# Workflow Builder Application - Deployment Guide

This guide covers containerization and deployment options for the Workflow Builder Application using Docker and Kubernetes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Helm Charts](#helm-charts)
5. [Environment-Specific Deployments](#environment-specific-deployments)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- kubectl (version 1.24+)
- Helm (version 3.8+)
- Git

### Optional for Kubernetes
- Minikube (for local development)
- Kind (Kubernetes in Docker)
- Docker Desktop with Kubernetes enabled

## Docker Deployment

### Building Docker Images

#### Backend Image
```bash
cd Assignment/backend
docker build -t workflow-backend:latest .
```

#### Frontend Image
```bash
cd Assignment/frontend
docker build -t workflow-frontend:latest .
```

### Running with Docker Compose

#### Development Environment
```bash
cd Assignment
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- ChromaDB vector database (port 8001)
- Redis cache (port 6379)
- Backend API (port 8000)
- Frontend React app (port 3000)

#### Production Environment
```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Docker Commands Reference

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Scale services
docker-compose up -d --scale backend=3

# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

## Kubernetes Deployment

### Setting Up Local Kubernetes

#### Option 1: Minikube
```bash
# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start minikube
minikube start --driver=docker

# Enable ingress addon
minikube addons enable ingress

# Get minikube IP
minikube ip
```

#### Option 2: Kind (Kubernetes in Docker)
```bash
# Install kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Create cluster
kind create cluster --name workflow-cluster

# Load Docker images into kind
kind load docker-image workflow-backend:latest --name workflow-cluster
kind load docker-image workflow-frontend:latest --name workflow-cluster
```

### Deploying with Kustomize

#### Development Environment
```bash
# Apply base configuration
kubectl apply -k k8s/base/

# Or apply development overlay
kubectl apply -k k8s/overlays/dev/
```

#### Production Environment
```bash
# Apply production overlay
kubectl apply -k k8s/overlays/prod/
```

### Deploying Individual Components

```bash
# Create namespace
kubectl apply -f k8s/base/namespace.yaml

# Deploy databases
kubectl apply -f k8s/base/postgres.yaml
kubectl apply -f k8s/base/chromadb.yaml
kubectl apply -f k8s/base/redis.yaml

# Deploy application
kubectl apply -f k8s/base/backend.yaml
kubectl apply -f k8s/base/frontend.yaml

# Deploy ingress
kubectl apply -f k8s/base/ingress.yaml
```

### Accessing the Application

#### Port Forwarding
```bash
# Access frontend
kubectl port-forward svc/frontend-service 3000:3000 -n workflow-builder

# Access backend
kubectl port-forward svc/backend-service 8000:8000 -n workflow-builder
```

#### Ingress (if enabled)
Add the following to your `/etc/hosts` file:
```
<minikube-ip> workflow.local
```

Then access: http://workflow.local

### Kubernetes Commands Reference

```bash
# Check pod status
kubectl get pods -n workflow-builder

# View logs
kubectl logs -f deployment/backend -n workflow-builder

# Scale deployments
kubectl scale deployment backend --replicas=3 -n workflow-builder

# Delete resources
kubectl delete -k k8s/base/
```

## Helm Charts

### Installing Helm

```bash
# Download and install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Deploying with Helm

#### Install Dependencies
```bash
cd Assignment/helm/workflow-builder
helm dependency update
```

#### Deploy to Development
```bash
helm install workflow-dev . \
  --namespace workflow-builder-dev \
  --create-namespace \
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1 \
  --set postgresql.enabled=true \
  --set redis.enabled=true \
  --set chromadb.enabled=true
```

#### Deploy to Production
```bash
helm install workflow-prod . \
  --namespace workflow-builder-prod \
  --create-namespace \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=3 \
  --set postgresql.enabled=true \
  --set redis.enabled=true \
  --set chromadb.enabled=true \
  --set ingress.enabled=true \
  --set autoscaling.enabled=true
```

### Customizing Values

Create a custom values file:
```yaml
# custom-values.yaml
backend:
  replicaCount: 2
  image:
    tag: "v1.2.0"
  resources:
    limits:
      cpu: 1000m
      memory: 1Gi

frontend:
  replicaCount: 2
  image:
    tag: "v1.2.0"

ingress:
  enabled: true
  hosts:
    - host: workflow.example.com
      paths:
        - path: /
          pathType: Prefix
```

Deploy with custom values:
```bash
helm install workflow-app . -f custom-values.yaml
```

### Helm Commands Reference

```bash
# List releases
helm list -A

# Upgrade release
helm upgrade workflow-dev . -f custom-values.yaml

# Rollback release
helm rollback workflow-dev 1

# Uninstall release
helm uninstall workflow-dev

# Get release status
helm status workflow-dev
```

## Environment-Specific Deployments

### Development Environment

**Features:**
- Single replica for each service
- Lower resource limits
- Debug logging enabled
- Hot reloading for development

**Deployment:**
```bash
# Docker Compose
docker-compose up -d

# Kubernetes with Kustomize
kubectl apply -k k8s/overlays/dev/

# Helm
helm install workflow-dev . --namespace workflow-builder-dev --create-namespace
```

### Staging Environment

**Features:**
- Multiple replicas for testing
- Production-like resource limits
- Monitoring enabled
- Automated testing

**Deployment:**
```bash
# Kubernetes with Kustomize
kubectl apply -k k8s/overlays/staging/

# Helm
helm install workflow-staging . --namespace workflow-builder-staging --create-namespace
```

### Production Environment

**Features:**
- High availability (multiple replicas)
- Resource limits and requests
- Horizontal Pod Autoscaling
- Ingress with SSL/TLS
- Monitoring and logging
- Backup strategies

**Deployment:**
```bash
# Kubernetes with Kustomize
kubectl apply -k k8s/overlays/prod/

# Helm
helm install workflow-prod . --namespace workflow-builder-prod --create-namespace
```

## Cloud Provider Deployments

### AWS EKS

#### Prerequisites
- AWS CLI configured
- eksctl installed
- kubectl configured for EKS

#### Create EKS Cluster
```bash
eksctl create cluster \
  --name workflow-cluster \
  --region us-west-2 \
  --nodegroup-name workflow-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 5
```

#### Deploy Application
```bash
# Build and push images to ECR
aws ecr create-repository --repository-name workflow-backend
aws ecr create-repository --repository-name workflow-frontend

# Tag and push images
docker tag workflow-backend:latest <account>.dkr.ecr.us-west-2.amazonaws.com/workflow-backend:latest
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/workflow-backend:latest

# Deploy with Helm
helm install workflow-prod . \
  --set backend.image.repository=<account>.dkr.ecr.us-west-2.amazonaws.com/workflow-backend \
  --set frontend.image.repository=<account>.dkr.ecr.us-west-2.amazonaws.com/workflow-frontend
```

### Google GKE

#### Prerequisites
- gcloud CLI configured
- kubectl configured for GKE

#### Create GKE Cluster
```bash
gcloud container clusters create workflow-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-medium
```

#### Deploy Application
```bash
# Build and push images to GCR
docker tag workflow-backend:latest gcr.io/<project-id>/workflow-backend:latest
docker push gcr.io/<project-id>/workflow-backend:latest

# Deploy with Helm
helm install workflow-prod . \
  --set backend.image.repository=gcr.io/<project-id>/workflow-backend \
  --set frontend.image.repository=gcr.io/<project-id>/workflow-frontend
```

## Troubleshooting

### Common Issues

#### Docker Issues

**Port Already in Use:**
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

**Permission Denied:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

#### Kubernetes Issues

**Pods Not Starting:**
```bash
# Check pod status
kubectl describe pod <pod-name> -n workflow-builder

# Check events
kubectl get events -n workflow-builder --sort-by='.lastTimestamp'
```

**Image Pull Errors:**
```bash
# Check image exists
docker images | grep workflow

# For kind, load images
kind load docker-image workflow-backend:latest --name workflow-cluster
```

**Service Not Accessible:**
```bash
# Check service endpoints
kubectl get endpoints -n workflow-builder

# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -- nslookup backend-service.workflow-builder.svc.cluster.local
```

#### Helm Issues

**Chart Dependencies:**
```bash
# Update dependencies
helm dependency update

# Check dependency status
helm dependency list
```

**Release Upgrade Issues:**
```bash
# Check release history
helm history workflow-dev

# Rollback to previous version
helm rollback workflow-dev 1
```

### Monitoring and Logging

#### View Application Logs
```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes
kubectl logs -f deployment/backend -n workflow-builder
kubectl logs -f deployment/frontend -n workflow-builder
```

#### Monitor Resource Usage
```bash
# Docker
docker stats

# Kubernetes
kubectl top pods -n workflow-builder
kubectl top nodes
```

### Backup and Recovery

#### Database Backup
```bash
# PostgreSQL backup
kubectl exec -it deployment/postgres -n workflow-builder -- pg_dump -U workflow_user workflow_db > backup.sql

# Restore
kubectl exec -i deployment/postgres -n workflow-builder -- psql -U workflow_user workflow_db < backup.sql
```

#### Persistent Volume Backup
```bash
# Create snapshot (if supported by storage class)
kubectl create volumesnapshot postgres-snapshot \
  --source-pvc=postgres-pvc \
  --volume-snapshot-class=csi-snapshotter
```

## Security Considerations

### Secrets Management
- Use Kubernetes secrets for sensitive data
- Consider using external secret management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

### Network Security
- Use Network Policies to restrict traffic
- Enable TLS/SSL for ingress
- Use service mesh (Istio) for advanced security

### Container Security
- Use non-root users in containers
- Scan images for vulnerabilities
- Keep base images updated
- Use minimal base images (Alpine, Distroless)

## Performance Optimization

### Resource Tuning
- Set appropriate CPU and memory limits
- Use Horizontal Pod Autoscaling
- Monitor resource usage and adjust accordingly

### Database Optimization
- Use connection pooling
- Optimize database queries
- Consider read replicas for read-heavy workloads

### Caching Strategy
- Use Redis for application caching
- Implement CDN for static assets
- Use browser caching headers

## Conclusion

This deployment guide provides comprehensive instructions for containerizing and deploying the Workflow Builder Application using Docker and Kubernetes. Choose the deployment method that best fits your environment and requirements.

For additional support or questions, please refer to the project documentation or create an issue in the repository.