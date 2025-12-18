# Quick Start Guide

## 🚀 Run Everything

### Simple Way (Recommended)
```bash
./scripts/run_all.sh
```

This starts both backend (port 8080) and frontend (port 5173) automatically.

### Individual Services

**Backend only:**
```bash
./scripts/run_backend.sh
```

**Frontend only:**
```bash
./scripts/run_frontend.sh
```

## 📋 Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn**

## 🔧 Configuration

### Backend (.env file)

The `.env` file already exists in `api/`. Update it with your settings:

```bash
# Enable Neo4j (set to false and provide credentials)
MOCK_NEO4J=true

# Enable MemMachine (set to false and provide endpoint)
MOCK_MEMVERGE=true
```

### Frontend

Frontend automatically connects to `http://localhost:8080`. To change:

```bash
export VITE_API_BASE_URL=http://your-backend-url:8080
npm run dev
```

## 🐳 Docker (Alternative)

```bash
# Production
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.dev.yml up
```

See [README_DOCKER.md](./README_DOCKER.md) for details.

## ✅ Verify It's Working

1. **Backend**: http://localhost:8080/api/health
2. **Frontend**: http://localhost:5173
3. **API Docs**: http://localhost:8080/api/docs

## 📚 More Information

- **Detailed Run Guide**: [RUN_GUIDE.md](./RUN_GUIDE.md)
- **Docker Guide**: [README_DOCKER.md](./README_DOCKER.md)
- **API Integration**: [frontend/API_INTEGRATION.md](./frontend/API_INTEGRATION.md)

