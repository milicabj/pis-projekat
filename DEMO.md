# Pharmacy App — Demo Guide

## Prerequisites

- Docker Desktop with Kubernetes enabled
- MongoDB seeded (see below)

---

## 1. Local development (without Docker)

```bash
# Terminal 1 — MongoDB (if not running)
mongod

# Terminal 2 — Redis (optional for cache demo)
redis-server

# Terminal 3 — Backend
cd backend && npm start

# Terminal 4 — Frontend
cd frontend/pharmacy-app && npm start
```

Open http://localhost:4200

---

## 2. Docker Compose

```bash
cd pharmacy
docker-compose up --build -d
docker-compose exec backend node seed.js
```

Open http://localhost

Check containers:
```bash
docker ps
```

---

## 3. Kubernetes deployment

Build images for local K8s (Docker Desktop):

```bash
docker build -t pharmacy-backend:latest ./backend
docker build -t pharmacy-frontend:latest ./frontend/pharmacy-app
```

**Important (Docker Desktop):** Kubernetes uses containerd and may not see images from `docker build`. If pods show `ErrImageNeverPull`, run:

```bash
chmod +x k8s/load-images.sh
./k8s/load-images.sh
```

Or manually:

```bash
docker save pharmacy-backend:latest | docker exec -i desktop-control-plane ctr -n k8s.io images import -
docker save pharmacy-frontend:latest | docker exec -i desktop-control-plane ctr -n k8s.io images import -
kubectl rollout restart deployment/backend-deployment deployment/frontend-deployment -n pharmacy
```

Apply manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/redis-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-configmap.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

Wait for pods:
```bash
kubectl get pods -n pharmacy -w
```

Seed database (once backend is running):
```bash
kubectl exec -n pharmacy deployment/backend-deployment -- node seed.js
```

Open http://localhost:30080

---

## 4. Two backend replicas (load balancing)

```bash
kubectl get deployment backend-deployment -n pharmacy
# Should show 2/2 ready
```

Test load distribution:
```bash
for i in {1..10}; do curl -s http://localhost:30080/api/products > /dev/null && echo "request $i"; done
kubectl logs -n pharmacy -l app=backend --prefix=true --tail=20
```

---

## 5. Pod failure + automatic recovery

```bash
kubectl get pods -n pharmacy -l app=backend
kubectl delete pod <one-backend-pod-name> -n pharmacy
kubectl get pods -n pharmacy -l app=backend -w
# New pod starts automatically
```

---

## 6. Rate limiting demo

```bash
for i in {1..15}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST http://localhost:30080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# After ~10 requests you should see 429
```

---

## 7. Redis cache demo

```bash
# First request — MISS
curl -v http://localhost:30080/api/products 2>&1 | grep X-Cache

# Second request — HIT
curl -v http://localhost:30080/api/products 2>&1 | grep X-Cache
```

Check Redis keys (Docker Compose):
```bash
docker exec -it pharmacy-redis redis-cli KEYS "*"
```

Check Redis keys (Kubernetes):
```bash
kubectl exec -n pharmacy deployment/redis -- redis-cli KEYS "*"
```

---

## 8. GitHub Actions CI/CD

Pipeline file: `.github/workflows/ci-cd.yml`

### What runs on every push to `main`

| Job | Stage | What it does |
|-----|-------|--------------|
| `CI — Backend` | Integration | `npm install` + syntax check |
| `CI — Frontend` | Integration | `npm install` + production build |
| `CD — Build & Push Images` | Delivery | Build & push Docker images to **GHCR** |
| `CD — Deploy to Kubernetes` | Deployment | Deploy to ephemeral **kind** cluster + smoke tests |

### What runs on pull requests

Only CI jobs (backend + frontend) — no deploy.

### Trigger a run

```bash
git add .
git commit -m "Add CD deployment stage to CI/CD pipeline"
git push origin main
```

Open: **GitHub → pis-projekat → Actions** tab

### What to show at defense

1. Green pipeline with all 4 jobs
2. **Packages** tab on GitHub — `pharmacy-backend` and `pharmacy-frontend` images
3. Deploy job logs showing:
   - `kubectl rollout status` — pods ready
   - `Seed uspješno završen`
   - `x-cache: miss` then `x-cache: hit`

### GHCR image locations

After a successful push:
```
ghcr.io/milicabj/pharmacy-backend:latest
ghcr.io/milicabj/pharmacy-frontend:latest
```

View: GitHub profile → **Packages**

---

## Points covered (30 total)

| Feature | Points |
|---------|--------|
| Dockerization | 5 |
| Kubernetes deployment | 5 |
| CI/CD (GitHub Actions) | 10 |
| Rate limiting | 5 |
| Redis caching | 5 |
