# Docker Deployment Guide

This guide explains how to run the Clinical PCP Support Agent using Docker.

## Quick Start

### Production Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Mode (with hot reload)

```bash
# Start with development configuration
docker-compose -f docker-compose.dev.yml up

# In another terminal, rebuild if needed
docker-compose -f docker-compose.dev.yml build
```

## Services

### Backend API (Port 8080)
- FastAPI application
- Health check: http://localhost:8080/api/health
- API docs: http://localhost:8080/api/docs

### Frontend (Port 80)
- React + Vite application
- Access: http://localhost

### MemMachine (Port 8081)
- Patient logs and session management
- Only used when `MOCK_MEMVERGE=false`

### Neo4j (Ports 7474, 7687)
- Knowledge graph database
- Only used when `MOCK_NEO4J=false`
- Access: http://localhost:7474

## Environment Variables

Create a `.env` file in the project root:

```bash
# Neo4j Configuration
MOCK_NEO4J=false
NEO4J_URI=neo4j://neo4j:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# MemMachine Configuration
MOCK_MEMVERGE=false
MEMMACHINE_ENDPOINT=http://memmachine:8081
MEMMACHINE_API_KEY=your-api-key

# Security
SECRET_KEY=your-secret-key-change-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost
```

## Using MemMachine for Patient Logs

1. **Enable MemMachine**:
   ```bash
   MOCK_MEMVERGE=false docker-compose up -d
   ```

2. **MemMachine stores**:
   - Patient intake sessions
   - Triage results
   - Patient logs and history
   - Session tokens with TTL

3. **Access MemMachine**:
   - API endpoint: http://localhost:8081
   - Data persists in `memmachine-data` volume

## Using Neo4j for Knowledge Graph

1. **Enable Neo4j**:
   ```bash
   MOCK_NEO4J=false docker-compose up -d neo4j
   ```

2. **Import knowledge pack**:
   ```bash
   docker-compose exec backend python scripts/ingest_knowledge_pack.py
   ```

3. **Access Neo4j Browser**:
   - http://localhost:7474
   - Username: `neo4j`
   - Password: (from NEO4J_PASSWORD env var)

## Volumes

Data persists in Docker volumes:
- `memmachine-data`: MemMachine patient logs
- `neo4j-data`: Neo4j database
- `neo4j-logs`: Neo4j logs
- `./data`: Application data (mounted from host)

## Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Check if port is in use
lsof -i :8080
```

### Frontend can't connect to backend
- Ensure `VITE_API_BASE_URL` in frontend matches backend URL
- Check CORS settings in backend
- Verify both services are on same network

### MemMachine connection issues
```bash
# Check MemMachine logs
docker-compose logs memmachine

# Verify endpoint is accessible
curl http://localhost:8081/health
```

## Production Deployment

1. **Update environment variables** in `.env`
2. **Set strong SECRET_KEY**
3. **Configure proper CORS origins**
4. **Use reverse proxy** (nginx/traefik) for SSL
5. **Set up backups** for volumes
6. **Monitor logs**: `docker-compose logs -f`

## Scaling

To scale backend instances:
```bash
docker-compose up -d --scale backend=3
```

Note: MemMachine and Neo4j should remain single instance.

