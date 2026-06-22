

**Login:** `admin@pharma.com` / `admin123`

**Bodovi:** Docker 5 + Kubernetes 5 + CI/CD 10 + Rate limiting 5 + Redis 5 = **30**

---

## VAŽNO za Mac (pročitaj prije odbrane)

Na Docker Desktop + macOS **NodePort `30080` često ne radi** sa hosta.
`curl` tada vraća HTTP `000` (nema konekcije) — to **nije** bug u aplikaciji.

**Rješenje za demo:** koristi `kubectl port-forward` na port **8080**.

| Demo | URL / način |
|------|-------------|
| Aplikacija u browseru | http://localhost:8080 (port-forward) |
| Redis keš | curl na localhost:8080 |
| Rate limiting | port-forward na **jedan** backend pod, port 5000 |

---

## BRZI START — Kubernetes od nule (prije odbrane)

```bash
cd /Users/milicabjelica/Desktop/apoteka-projekat/PROJEKAT-WEB/pharmacy

# Build Docker image-a lokalno
docker build -t pharmacy-backend:latest ./backend
docker build -t pharmacy-frontend:latest ./frontend/pharmacy-app

# Uvezi image-e u Kubernetes (Docker Desktop koristi containerd)
chmod +x k8s/load-images.sh
./k8s/load-images.sh

# Prvo namespace, pa ostali manifesti (izbjegava race condition)
kubectl apply -f k8s/namespace.yaml
sleep 2
kubectl apply -f k8s/

# Sačekaj da svi podovi budu Running (Ctrl+C za izlaz)
kubectl get pods -n pharmacy -w

# Popuni bazu test podacima
kubectl exec -n pharmacy deployment/backend-deployment -- node seed.js
```

**Očekivano:** 5 podova Running (2 backend, 1 frontend, mongodb, redis)

---

## TERMINAL ZA CIJELU ODBRANU (drži otvoren)

```bash
# Prosleđuje frontend servis na lokalni port 8080
# Bez ovoga curl/browser na :30080 često ne radi na Mac-u
kubectl port-forward -n pharmacy svc/frontend-service 8080:80
```

Ostavi ovaj terminal otvoren. U drugom terminalu radiš sve ostalo.

**Browser:** http://localhost:8080

---

# CHEAT SHEET — redoslijed za profesora (~15 min)

---

## 0. Uvod (30 sek)

Kaži: Angular + Express + MongoDB apoteka, proširena sa Docker, Kubernetes, CI/CD, Redis keš, rate limiting — 30 bodova.

---

## 1. DOCKER (5 bodova)

**Kaži:** "Aplikacija je u Docker kontejnerima, orkestrirana docker-compose."

```bash
cd /Users/milicabjelica/Desktop/apoteka-projekat/PROJEKAT-WEB/pharmacy

# Pokreni 4 servisa: mongodb, redis, backend, frontend
docker compose up --build -d

# Popuni bazu (samo prvi put ili prazna baza)
docker compose exec backend node seed.js

# Prikaži running kontejnere — očekuj 4 servisa
docker compose ps
```

**Otvori:** http://localhost (Docker demo, bez K8s)

**Pokaži fajlove:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/pharmacy-app/Dockerfile`

**Zašto service names umjesto localhost u compose-u:**
- Backend koristi `mongodb://mongodb:27017` — `mongodb` je ime servisa u Docker mreži
- nginx u frontendu šalje `/api/` na `http://backend:5000`

```bash
# Log backend-a — očekuj: "Povezan sa bazom", "Redis povezan"
docker compose logs backend --tail=15

# Zaustavi compose kad završiš Docker demo
docker compose down
```

---

## 2. KUBERNETES (5 bodova)

**Kaži:** "Deploy u namespace pharmacy, backend 2 replike, MongoDB StatefulSet, Redis, frontend NodePort."

```bash
# Status svih podova — očekuj 5 Running
kubectl get pods -n pharmacy

# Servisi — frontend NodePort 30080, ostali ClusterIP
kubectl get services -n pharmacy

# Backend ima 2 replike
kubectl get deployment backend-deployment -n pharmacy
```

**Pokaži fajlove:** `k8s/backend-deployment.yaml` (replicas: 2), `k8s/configmap.yaml`, `k8s/secret.yaml`

**Objašnjenje servisa:**
- `backend-service` ClusterIP — interni, load balancing na 2 poda
- `frontend-service` NodePort 30080 — eksterni pristup (na Mac-u često ne radi)
- `mongodb-service` headless — baza
- `redis-service` ClusterIP — keš

**Browser (preko port-forward):** http://localhost:8080

---

## 3. LOAD BALANCING (obavezna demo stavka)

**Priprema:** Terminal 1 mora imati aktivan port-forward:
```bash
kubectl port-forward -n pharmacy svc/frontend-service 8080:80
```

---

### Korak 1 — Pokaži da imaš 2 replike

**Kaži:** "Backend Deployment ima dvije replike. Kubernetes Service ih tretira kao jednu grupu i raspodjeljuje zahtjeve."

```bash
# Očekuj: READY 2/2
kubectl get deployment backend-deployment -n pharmacy

# Očekuj: 2 različita imena podova
kubectl get pods -n pharmacy -l app=backend
```

Primjer outputa:
```
backend-deployment-79d9cf444c-6pd78
backend-deployment-79d9cf444c-8cb9f
```

**Pokaži fajl (opciono):** `k8s/backend-deployment.yaml` → linija `replicas: 2`

---

### Korak 2 — Pokaži Service koji balansira

```bash
kubectl get svc backend-service -n pharmacy
```

**Kaži:** "`backend-service` je ClusterIP tip. Selektor `app: backend` šalje saobraćaj na oba poda."

---

### Korak 3 — Pošalji više zahtjeva

```bash
for i in {1..15}; do
  curl -s http://localhost:8080/api/products > /dev/null && echo "request $i OK"
done
```

**Kaži:** "Frontend nginx prosljeđuje `/api/` na `backend-service`, a Service dijeli zahtjeve između replika."

---

### Korak 4 — Pokaži logove oba poda

```bash
kubectl logs -n pharmacy -l app=backend --prefix=true --tail=10
```

**Pokaži:** prefiks `[pod/backend-deployment-...-6pd78]` i `[pod/...-8cb9f]` — oba poda obrađuju zahtjeve.

Ako logovi nisu očigledni, pošalji još zahtjeva pa ponovi:

```bash
for i in {1..20}; do curl -s http://localhost:8080/api/products > /dev/null; done
kubectl logs -n pharmacy -l app=backend --prefix=true --since=30s
```

---

### Korak 5 — Jedna rečenica za profesora

> "Load balancing je implementiran kroz Kubernetes Service i Deployment sa dvije backend replike. Service prima zahtjeve i raspodjeljuje ih na podove round-robin principom. Frontend ne zna za pojedinačne podove — zove samo `backend-service`."

---

### Ako pita "gdje je u kodu?"

| Šta | Gdje |
|-----|------|
| 2 replike | `k8s/backend-deployment.yaml` → `replicas: 2` |
| Service / LB | `k8s/backend-service.yaml` → selector `app: backend` |
| Proxy ka backendu | `k8s/frontend-configmap.yaml` → `proxy_pass http://backend-service:5000/api/` |

---

### Ako nešto ne radi

| Problem | Rješenje |
|---------|----------|
| Samo 1 pod | `kubectl scale deployment backend-deployment -n pharmacy --replicas=2` |
| curl ne radi | Port-forward na 8080 aktivan? |
| Logovi prazni | Pošalji 20+ curl zahtjeva, pa `--since=1m` |

---

### Kratka verzija (1 min — ako profesor žuri)

1. `kubectl get pods -n pharmacy -l app=backend` → **2 poda**
2. `for i in {1..15}; do curl -s http://localhost:8080/api/products > /dev/null && echo "request $i OK"; done`
3. `kubectl logs -n pharmacy -l app=backend --prefix=true --tail=10`
4. Objasni Service + 2 replike

---

## 4. RESILIENCE — pad poda (obavezna demo stavka)

**Kaži:** "Deployment automatski kreira novi pod ako jedan padne."

```bash
# Zapamti imena 2 backend poda
kubectl get pods -n pharmacy -l app=backend

# Obriši JEDAN pod (zamijeni ime)
kubectl delete pod <IME-JEDNOG-BACKEND-PODA> -n pharmacy

# Gledaj kako Kubernetes kreira novi — Ctrl+C za izlaz
kubectl get pods -n pharmacy -l app=backend -w
```

**Očekivano:** stari pod `Terminating`, novi pod `Running`, ukupno i dalje 2 poda.

```bash
# Aplikacija i dalje radi
curl -s http://localhost:8080/api/products | head -c 80
```

---

## 5. REDIS KEŠ (5 bodova)

**Kaži:** "GET /api/products kešira se u Redis 60 sekundi. X-Cache header pokazuje MISS/HIT."

**Port-forward na frontend (8080) mora biti aktivan u drugom terminalu.**

```bash
# PRVI zahtjev — podaci iz MongoDB, keš prazan
curl -s -D - http://localhost:8080/api/products -o /dev/null | grep -i x-cache
```

**Očekivano:** `x-cache: miss`

```bash
# DRUGI zahtjev — podaci iz Redis-a
curl -s -D - http://localhost:8080/api/products -o /dev/null | grep -i x-cache
```

**Očekivano:** `x-cache: hit`

```bash
# Prikaži ključ u Redis-u
kubectl exec -n pharmacy deployment/redis -- redis-cli KEYS "*"
```

**Očekivano:** `products:/api/products`

**Pokaži kod:** `backend/middleware/cacheMiddleware.js`, `backend/cache/redisClient.js`

**Alternativa ako localhost ne radi** (uvijek radi unutar klastera):

```bash
kubectl exec -n pharmacy deployment/frontend-deployment -- sh -c \
  'wget -qS -O /dev/null http://127.0.0.1/api/products 2>&1 | grep -i x-cache'
```

Pokreni istu komandu dvaput — prvo MISS, drugo HIT.

**Ako Redis ne radi:** app i dalje radi (fail-open), samo nema keša.

---

## 6. RATE LIMITING (5 bodova)

**Kaži:** "express-rate-limit: globalno 100 req/15 min, auth ruta 10 req/15 min. Prekoračenje → HTTP 429."

**VAŽNO za Mac + 2 replike:**
Limiter drži brojač **u memoriji svakog poda**. Sa 2 replike, zahtjevi se dijele → teško dobiti 429 preko frontend-a.

**Za demo testiraj na JEDNOM backend podu:**

```bash
# Nađi ime jednog backend poda
kubectl get pods -n pharmacy -l app=backend
```

**Novi terminal (odvojen od frontend port-forward):**

```bash
# Forward SAMO na jedan pod — zamijeni ime
kubectl port-forward -n pharmacy pod/<IME-BACKEND-PODA> 5000:5000
```

**Još jedan terminal — test:**

```bash
for i in {1..15}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

**Očekivano:**
- Request 1–10: `401` (pogrešna lozinka, limit nije dostignut)
- Request 11–15: `429` (Too Many Requests — rate limiter blokirao)

**Pokaži kod:** `backend/server.js` — `globalLimiter` i `authLimiter`

**Ako profesor pita zašto 2 replike smetaju:**
> "In-memory limiter je po instanci. U produkciji bi se koristio Redis store za shared limit."

**Poslije demo-a vrati 2 replike ako si skalirala:**

```bash
kubectl scale deployment backend-deployment -n pharmacy --replicas=2
```

---

## 7. CI/CD — GitHub Actions (10 bodova)

**Kaži:** "Na push u main: CI testira, CD build-uje image-e, push na GHCR, deploy u privremeni K8s klaster u CI-u."

**U browseru (ne terminal):**

1. https://github.com/milicabj/pis-projekat/actions
2. Posljednji run — 4 zelena job-a:
   - CI — Backend
   - CI — Frontend
   - CD — Build & Push Images
   - CD — Deploy to Kubernetes
3. Deploy log: `rollout status`, `Seed uspješno završen`, `x-cache: miss/hit`
4. GitHub Packages: `pharmacy-backend`, `pharmacy-frontend`

**Fajl:** `.github/workflows/ci-cd.yml`

**Iskreno objašnjenje:**
- CI = integracija (test + build)
- CD = push image-a na GHCR + deploy u **privremeni** kind klaster na GitHub runner-u
- Ne deploy-uje automatski na tvoj Mac — to radiš ručno sa `kubectl apply`

**Opciono pokreni novi pipeline:**

```bash
git commit --allow-empty -m "Trigger CI/CD for defense demo"
git push origin main
```

---

## 8. ZAVRŠNA REČENICA

> "Implementirala sam Dockerizaciju, Kubernetes sa load balancing-om i self-healing-om, CI/CD sa GitHub Actions, Redis keširanje i rate limiting — ukupno 30 bodova."

---

# REFERENCE — svi korisni commandi

## Kubernetes

```bash
kubectl get pods -n pharmacy
kubectl get services -n pharmacy
kubectl get deployment backend-deployment -n pharmacy
kubectl logs -n pharmacy -l app=backend --tail=20
kubectl describe pod <ime> -n pharmacy
kubectl exec -n pharmacy deployment/backend-deployment -- node seed.js
kubectl apply -f k8s/namespace.yaml && sleep 2 && kubectl apply -f k8s/
./k8s/load-images.sh
```

## Port-forward (Mac)

```bash
# Frontend — drži otvoren cijelu odbranu
kubectl port-forward -n pharmacy svc/frontend-service 8080:80

# Backend jedan pod — samo za rate limit demo
kubectl port-forward -n pharmacy pod/<backend-pod-ime> 5000:5000
```

## Docker Compose

```bash
docker compose up --build -d
docker compose ps
docker compose logs backend --tail=20
docker compose exec backend node seed.js
docker compose down
```

## Redis + Rate limit test (copy-paste)

```bash
# Redis MISS / HIT (frontend port-forward 8080 mora biti aktivan)
curl -s -D - http://localhost:8080/api/products -o /dev/null | grep -i x-cache
curl -s -D - http://localhost:8080/api/products -o /dev/null | grep -i x-cache

# Rate limit (backend pod port-forward 5000 mora biti aktivan)
for i in {1..15}; do curl -s -o /dev/null -w "Request $i: %{http_code}\n" -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done
```

---

# TOP 10 FAJLOVA ZA ODBRANU

| Fajl | Zašto |
|------|-------|
| `docker-compose.yml` | Docker orkestracija |
| `backend/Dockerfile` | Backend image |
| `frontend/pharmacy-app/Dockerfile` | Frontend + nginx image |
| `backend/server.js` | Rate limiting |
| `backend/middleware/cacheMiddleware.js` | Redis keš |
| `k8s/backend-deployment.yaml` | 2 replike |
| `k8s/frontend-service.yaml` | NodePort 30080 |
| `k8s/configmap.yaml` | Env varijable |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline |
| `frontend/pharmacy-app/nginx.conf` | API proxy |

---

# TROUBLESHOOTING

| Problem | Rješenje |
|---------|----------|
| `No resources found in pharmacy namespace` | `kubectl apply -f k8s/namespace.yaml && sleep 2 && kubectl apply -f k8s/` |
| `ErrImageNeverPull` | `./k8s/load-images.sh` |
| curl HTTP `000` | Koristi port-forward 8080, ne :30080 |
| grep prazan za x-cache | Port-forward nije aktivan ili curl ne stiže do servera |
| Samo 401, nikad 429 | Testiraj rate limit na jednom backend podu (port 5000) |
| Prazna baza | `kubectl exec ... node seed.js` |
| Redis uvijek MISS | `kubectl logs ... backend \| grep Redis` — treba "Redis povezan" |

---

# BODOVI

| Feature | Bodovi |
|---------|--------|
| Dockerization | 5 |
| Kubernetes deployment | 5 |
| CI/CD (GitHub Actions) | 10 |
| Rate limiting | 5 |
| Redis caching | 5 |
| **UKUPNO** | **30** |
