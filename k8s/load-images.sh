#!/bin/bash
# Uvezi lokalne Docker image-e u Kubernetes (Docker Desktop + containerd)
set -e

cd "$(dirname "$0")/.."

echo "Building images..."
docker build -t pharmacy-backend:latest ./backend
docker build -t pharmacy-frontend:latest ./frontend/pharmacy-app

echo "Importing into Kubernetes node..."
docker save pharmacy-backend:latest | docker exec -i desktop-control-plane ctr -n k8s.io images import -
docker save pharmacy-frontend:latest | docker exec -i desktop-control-plane ctr -n k8s.io images import -

echo "Ensuring namespace exists..."
kubectl apply -f k8s/namespace.yaml

if kubectl get deployment backend-deployment -n pharmacy >/dev/null 2>&1; then
  echo "Restarting deployments..."
  kubectl rollout restart deployment/backend-deployment deployment/frontend-deployment -n pharmacy
else
  echo "Deployments not found yet — run: kubectl apply -f k8s/"
fi

echo "Done. Check: kubectl get pods -n pharmacy"
