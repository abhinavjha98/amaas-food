# Fix Git History - Remove Secrets

GitHub blocked your push because Stripe secret keys were found in your commit history. Here's how to fix it:

## ✅ What I Fixed

1. **Removed hardcoded Stripe keys** from `backend/app/routes/checkout.py`
2. **Updated code** to only use environment variables
3. **Created `.env.example`** file (template for environment variables)
4. **Verified `.gitignore`** includes `.env` files

## 🔧 Next Steps - Fix Git History

You need to remove the secrets from your git history. Here are your options:

### Option 1: Use GitHub's Secret Scanning (Easiest)

GitHub provided a URL to allow the secret. You can:

1. **Visit the URL** GitHub provided:
   ```
   https://github.com/abhinavjha98/ammas-backend/security/secret-scanning/unblock-secret/38GNjdswGx01C9bRFCxMfNVTVWB
   ```

2. **Allow the secret** (if it's a test key, you can allow it temporarily)

3. **Then immediately**:
   - Remove the secret from the code (already done ✅)
   - Create a new commit
   - Push again

**⚠️ Warning:** Only do this if it's a TEST key. For production keys, use Option 2.

### Option 2: Remove Secret from Git History (Recommended)

If you want to completely remove the secret from git history:

```bash
# 1. Make sure you're on the branch with the issue
git checkout master

# 2. Use git filter-branch or BFG Repo-Cleaner to remove the secret
# Option A: Using git filter-branch (built-in)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/app/routes/checkout.py" \
  --prune-empty --tag-name-filter cat -- --all

# Then restore the file with the fixed version
git checkout HEAD -- backend/app/routes/checkout.py
git add backend/app/routes/checkout.py
git commit -m "Remove hardcoded Stripe keys, use environment variables"

# Option B: Using BFG Repo-Cleaner (easier, but requires installation)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
# java -jar bfg.jar --replace-text passwords.txt
```

### Option 3: Start Fresh (If history doesn't matter)

If you don't care about preserving git history:

```bash
# 1. Remove the remote
git remote remove origin

# 2. Create a new orphan branch
git checkout --orphan clean-master

# 3. Add all files (secrets are already removed)
git add .
git commit -m "Initial commit - secrets removed"

# 4. Delete old master branch
git branch -D master

# 5. Rename current branch to master
git branch -m master

# 6. Force push to GitHub (⚠️ This rewrites history)
git remote add origin https://github.com/abhinavjha98/ammas-backend.git
git push -f origin master
```

## 🔐 Set Up Environment Variables

After fixing git history, make sure to:

1. **Create `.env` file** in `backend/` directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env`** and add your actual Stripe keys:
   ```env
   STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
   STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L
   ```

3. **Verify `.env` is in `.gitignore`** (it should be already)

4. **For Azure deployment**, set these as environment variables in Azure Portal (not in code!)

## ✅ Verify Fix

After pushing, verify:

1. **Check the code** - No hardcoded secrets:
   ```bash
   grep -r "sk_test_51SpGQtF5Zsiqo5SKYXS" backend/
   # Should return nothing
   ```

2. **Test locally** - Make sure app still works:
   ```bash
   cd backend
   python run.py
   ```

3. **Push to GitHub** - Should work now:
   ```bash
   git add .
   git commit -m "Remove hardcoded secrets, use environment variables"
   git push origin master
   ```

## 🚨 Important Security Notes

1. **Rotate your Stripe keys** - Since they were exposed in git history, consider:
   - Going to Stripe Dashboard → Developers → API keys
   - Revoking the old test keys
   - Creating new test keys
   - Update your `.env` file with new keys

2. **Never commit secrets** - Always use:
   - `.env` files (gitignored)
   - Environment variables in production
   - Secret management services (Azure Key Vault, AWS Secrets Manager, etc.)

3. **For production**, use:
   - Azure Key Vault (for Azure deployments)
   - Environment variables in Container Apps/App Services
   - Never hardcode in code or config files

## 📝 Current Status

✅ **Fixed in code**: Secrets removed from `checkout.py`  
✅ **Environment variables**: Code now uses `os.getenv()` only  
✅ **`.env.example`**: Template created  
✅ **`.gitignore`**: Already includes `.env`  

⏳ **Action needed**: Fix git history (choose one option above)
