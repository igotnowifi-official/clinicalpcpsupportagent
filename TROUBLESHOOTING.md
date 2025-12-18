# Troubleshooting Guide

## Python 3.13 Installation Issues

### PyYAML Build Error

**Problem**: `ERROR: Failed to build 'pyyaml'` when installing requirements on Python 3.13.

**Solution**: 
1. Upgrade pip, setuptools, and wheel:
   ```bash
   pip install --upgrade pip setuptools wheel
   ```

2. Install PyYAML 6.0.1+ explicitly:
   ```bash
   pip install "pyyaml>=6.0.1"
   ```

3. Then install other requirements:
   ```bash
   pip install -r api/requirements.txt
   ```

**Root Cause**: Python 3.13 is very new, and older PyYAML versions don't have pre-built wheels. Version 6.0.1+ has Python 3.13 support.

### Pydantic Version Conflicts

**Problem**: Dependency conflicts between pydantic and pydantic-settings.

**Solution**: The requirements.txt has been updated to use:
- `pydantic>=2.0.0` (instead of 1.10.14)
- `pydantic-settings>=2.0.0`

**Note**: Pydantic v2 requires importing `BaseSettings` from `pydantic_settings` instead of `pydantic`. The code has been updated to handle both versions.

## Backend Won't Start

### Port Already in Use
```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process or use a different port
```

### Missing Dependencies
```bash
# Reinstall dependencies
source venv/bin/activate
pip install -r api/requirements.txt
```

### Import Errors
- Check Python version: `python3 --version` (needs 3.11+)
- Verify virtual environment is activated
- Check that all route files are properly imported in `api/main.py`

## Frontend Won't Start

### Port Already in Use
```bash
# Check what's using port 5173
lsof -i :5173

# Or change port in vite.config.ts
```

### Module Not Found
```bash
# Reinstall dependencies
npm install
```

## API Connection Errors

### CORS Errors
- Verify `FRONTEND_URL` in `api/.env` matches frontend URL
- Check CORS configuration in `api/main.py`
- Ensure backend is running

### 404 Not Found
- Verify route is registered in `api/main.py`
- Check API endpoint path matches frontend config
- Restart backend after adding new routes

### Connection Refused
- Verify backend is running: `curl http://localhost:8080/api/health`
- Check `VITE_API_BASE_URL` in frontend matches backend URL
- Check firewall settings

## Docker Issues

### Build Fails
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs
```

### Services Won't Start
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
```

### Volume Permission Issues
```bash
# Fix permissions
sudo chown -R $USER:$USER ./data
```

## MemMachine Issues

### Connection Failed
- Verify MemMachine service is running
- Check `MEMMACHINE_ENDPOINT` in `.env`
- Verify API key is correct
- Check network connectivity between services

### Fallback to Mock
- If MemMachine connection fails, system falls back to MockMemoryStore
- Check logs for connection errors
- Verify MemMachine container is running (if using Docker)

## Neo4j Issues

### Connection Failed
- Verify Neo4j service is running
- Check credentials in `.env`
- Verify URI format: `neo4j://` or `neo4j+s://`
- Test connection: `python scripts/test_connect.py`

### Import Errors
- Ensure knowledge pack Excel file exists
- Check file path in `KNOWLEDGE_PACK_PATH`
- Verify Neo4j has sufficient memory allocated

## General Tips

1. **Always activate virtual environment** before running backend:
   ```bash
   source venv/bin/activate
   ```

2. **Check logs** for detailed error messages:
   - Backend: Console output or `api/data/audit.log`
   - Frontend: Browser console (F12)

3. **Restart services** after configuration changes

4. **Verify environment variables** are set correctly

5. **Use health checks**:
   - Backend: `curl http://localhost:8080/api/health`
   - Frontend: Open in browser

