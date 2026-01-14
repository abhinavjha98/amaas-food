# Fix: Gunicorn WSGI Error in Production

## Problem

**Error:**
```
TypeError: create_app() takes from 0 to 1 positional arguments but 2 were given
```

**Cause:**
- Gunicorn was trying to call `app:create_app` directly
- `create_app()` is a factory function, not a WSGI application
- Gunicorn passes WSGI environment and start_response as arguments, but `create_app()` only accepts `config_name`

## Solution Applied

### 1. Created `wsgi.py` Entry Point

Created `backend/wsgi.py` that:
- Imports `create_app` from `app`
- Instantiates the Flask app: `app = create_app(config_name='production')`
- Exports the `app` object for gunicorn to use

### 2. Updated Dockerfile

Changed gunicorn command from:
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--timeout", "600", "--workers", "2", "--threads", "2", "app:create_app"]
```

To:
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--timeout", "600", "--workers", "2", "--threads", "2", "wsgi:app"]
```

### 3. Fixed Production Config

Updated `backend/app/__init__.py` to:
- Use environment variables for production instead of importing non-existent `config.ProductionConfig`
- Require `DATABASE_URL` and `JWT_SECRET_KEY` in production

## Files Changed

1. ✅ `backend/wsgi.py` - New file (WSGI entry point)
2. ✅ `backend/Dockerfile` - Updated gunicorn command
3. ✅ `backend/app/__init__.py` - Fixed production config

## Next Steps

1. **Commit and push the changes:**
   ```bash
   git add backend/wsgi.py backend/Dockerfile backend/app/__init__.py
   git commit -m "Fix gunicorn WSGI error - add wsgi.py entry point"
   git push origin master
   ```

2. **GitHub Actions will automatically:**
   - Build new Docker image
   - Deploy to Container App
   - Create new revision

3. **Verify deployment:**
   - Check GitHub Actions (should succeed now)
   - Check Azure Portal → Container App → Log stream
   - Test your API endpoint

## How It Works Now

```
Gunicorn → wsgi.py → create_app() → Flask app instance
```

Instead of:
```
Gunicorn → app:create_app (tries to call factory as WSGI app) ❌
```

## Testing Locally

You can test the WSGI entry point locally:

```bash
cd backend
gunicorn --bind 0.0.0.0:8000 wsgi:app
```

Or with Docker:
```bash
docker build -t ammas-backend-test .
docker run -p 8000:8000 -e DATABASE_URL=sqlite:///./data/test.db -e JWT_SECRET_KEY=test ammas-backend-test
```

## Environment Variables Required in Production

Make sure these are set in Azure Container App:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLIC_KEY` - Stripe public key
- `FLASK_ENV` - Set to `production` (optional, defaults to production in wsgi.py)

## Verification

After deployment, check logs:
```bash
az containerapp logs show \
  --name ammas-food-backend \
  --resource-group ammas-food-rg \
  --follow
```

You should see:
```
[INFO] Starting gunicorn 21.2.0
[INFO] Listening at: http://0.0.0.0:8000
[INFO] Booting worker with pid: X
```

No more TypeError! ✅
