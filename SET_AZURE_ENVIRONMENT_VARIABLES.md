# Set Environment Variables in Azure Container App

## Problem

Your Container App workers are failing to boot because required environment variables are missing.

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens

## Solution: Set Environment Variables

### Option 1: Using Azure Portal (Easiest)

1. **Go to Azure Portal**
   - Navigate to your Container App: `ammas-food-backend`
   - Resource Group: `ammas-food-rg`

2. **Go to Environment variables**
   - Click **"Environment variables"** in the left menu
   - Or go to **"Configuration"** → **"Environment variables"** tab

3. **Add Required Variables**

   Click **"+ Add"** for each variable:

   **DATABASE_URL:**
   - Name: `DATABASE_URL`
   - Value: `postgresql://username:password@host:port/database`
   - Example: `postgresql://ammasadmin:YourPassword@ammas-food-db-xxx.postgres.database.azure.com:5432/postgres`

   **JWT_SECRET_KEY:**
   - Name: `JWT_SECRET_KEY`
   - Value: Generate a strong random string (at least 32 characters)
   - Example: `your-super-secret-jwt-key-change-this-in-production-12345`

   **STRIPE_SECRET_KEY:**
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L`

   **STRIPE_PUBLIC_KEY:**
   - Name: `STRIPE_PUBLIC_KEY`
   - Value: `pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4`

   **FLASK_ENV (Optional):**
   - Name: `FLASK_ENV`
   - Value: `production`

4. **Save**
   - Click **"Save"** at the top
   - Wait for the revision to update (takes 1-2 minutes)

### Option 2: Using Azure CLI

```bash
# Set environment variables
az containerapp update \
  --name ammas-food-backend \
  --resource-group ammas-food-rg \
  --set-env-vars \
    "DATABASE_URL=postgresql://ammasadmin:YourPassword@your-db.postgres.database.azure.com:5432/postgres" \
    "JWT_SECRET_KEY=your-super-secret-jwt-key-change-this" \
    "STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L" \
    "STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4" \
    "FLASK_ENV=production"
```

## Get Database Connection String

If you don't have the database connection string:

1. **Go to Azure Portal** → Your PostgreSQL Database
2. **Click "Connection strings"** in left menu
3. **Copy the "psql" connection string**
4. **Format it as:**
   ```
   postgresql://username:password@host:5432/database
   ```

Or construct it manually:
```
postgresql://[admin-username]:[admin-password]@[server-name].postgres.database.azure.com:5432/postgres
```

## Generate JWT Secret Key

You can generate a secure JWT secret key:

**Using Python:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Or use an online generator:**
- https://randomkeygen.com/

## Verify Environment Variables

After setting, verify they're applied:

```bash
az containerapp show \
  --name ammas-food-backend \
  --resource-group ammas-food-rg \
  --query "properties.template.containers[0].env" \
  --output table
```

## After Setting Variables

1. **Wait 1-2 minutes** for the revision to update
2. **Check logs** to see if workers boot successfully:
   ```bash
   az containerapp logs show \
     --name ammas-food-backend \
     --resource-group ammas-food-rg \
     --follow
   ```
3. **Test the API:**
   ```bash
   curl https://your-container-app-url.azurecontainerapps.io/api/auth/health
   ```

## Common Issues

### "Worker failed to boot" still happening

1. **Check logs** for specific error messages
2. **Verify DATABASE_URL format** - must be valid PostgreSQL connection string
3. **Check database firewall** - Container App needs access to database
4. **Verify JWT_SECRET_KEY** - must not be empty

### Database Connection Failed

1. **Check database firewall rules:**
   - Azure Portal → Database → Networking
   - Allow Azure services: **Yes**
   - Or add Container App's outbound IP to allowed list

2. **Verify connection string:**
   - Username and password are correct
   - Server name is correct
   - Port is 5432

### Still Not Working

1. **Check Container App logs** in Azure Portal
2. **Check revision status** - should be "Active"
3. **Try restarting** the Container App
4. **Check if database is running** and accessible

## Complete List of Environment Variables

**Required:**
- `DATABASE_URL` - Database connection string
- `JWT_SECRET_KEY` - JWT secret key

**Recommended:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLIC_KEY` - Stripe public key
- `FLASK_ENV` - Set to `production`

**Optional:**
- `GOOGLE_MAPS_API_KEY` - For maps features
- `MAIL_SERVER` - Email server (default: smtp.gmail.com)
- `MAIL_PORT` - Email port (default: 587)
- `MAIL_USERNAME` - Email username
- `MAIL_PASSWORD` - Email password
- `AI_SERVICE_URL` - AI service URL (if using separate service)
- `SECRET_KEY` - Flask secret key (defaults to JWT_SECRET_KEY)

---

**After setting these variables, your Container App should start successfully!** ✅
