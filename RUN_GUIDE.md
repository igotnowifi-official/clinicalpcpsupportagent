# How to Run Backend and Frontend

## Quick Start

### Option 1: Run Both Together (Recommended)
```bash
./scripts/run_all.sh
```

This starts both backend and frontend servers simultaneously.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
./scripts/run_backend.sh
```

**Terminal 2 - Frontend:**
```bash
./scripts/run_frontend.sh
```

### Option 3: Manual Commands

**Backend:**
```bash
cd api
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

**Frontend:**
```bash
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api/docs
- **Health Check**: http://localhost:8080/api/health

## Environment Configuration

### Backend (.env file in `api/` directory)

Create `api/.env` with:

```bash
# Environment
ENV=development
DEBUG=true

# Neo4j (if using)
MOCK_NEO4J=true
# Or set to false and provide:
# NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
# NEO4J_USERNAME=neo4j
# NEO4J_PASSWORD=your-password

# MemMachine (if using)
MOCK_MEMVERGE=true
# Or set to false and provide:
# MEMMACHINE_ENDPOINT=http://localhost:8081
# MEMMACHINE_API_KEY=your-api-key

# Security
SECRET_KEY=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (Environment Variables)

Set `VITE_API_BASE_URL` if backend is on different URL:

```bash
export VITE_API_BASE_URL=http://localhost:8080
npm run dev
```

Or create `.env` in project root:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Using MemMachine for Patient Logs

1. **Install MemMachine** (if not using Docker):
   - Follow MemVerge installation guide
   - Start MemMachine service on port 8081

2. **Update backend config**:
   ```bash
   # In api/.env
   MOCK_MEMVERGE=false
   MEMMACHINE_ENDPOINT=http://localhost:8081
   MEMMACHINE_API_KEY=your-api-key
   ```

3. **Restart backend** - it will automatically use MemMachine

## Using Neo4j for Knowledge Graph

1. **Set up Neo4j**:
   - Use Neo4j Aura (cloud) or local instance
   - Get connection URI and credentials

2. **Update backend config**:
   ```bash
   # In api/.env
   MOCK_NEO4J=false
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your-password
   ```

3. **Import knowledge pack**:
   ```bash
   python scripts/ingest_knowledge_pack.py
   ```

4. **Restart backend** - it will use Neo4j for knowledge base

## Docker Deployment

See [README_DOCKER.md](./README_DOCKER.md) for Docker setup.

```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up
```

## Troubleshooting

### Backend won't start
- Check Python version: `python3 --version` (needs 3.11+)
- Install dependencies: `pip install -r api/requirements.txt`
- Check port 8080 is available: `lsof -i :8080`

### Frontend won't start
- Check Node version: `node --version` (needs 18+)
- Install dependencies: `npm install`
- Check port 5173 is available: `lsof -i :5173`

### CORS errors
- Ensure `FRONTEND_URL` in backend matches frontend URL
- Check backend CORS configuration in `api/main.py`

### API connection errors
- Verify backend is running: `curl http://localhost:8080/api/health`
- Check `VITE_API_BASE_URL` matches backend URL
- Check browser console for detailed errors

