# 🔧 Fix Backend 404 Error - Complete Guide

Your edge function is returning 404 errors because it hasn't been properly deployed yet. Follow these steps to fix it.

## 📋 What You Need

1. ✅ Supabase account (you have this)
2. ✅ Project ID: `tnlceozwrkspncxwcaqe` (you have this)
3. ⚠️ Supabase CLI (need to install)
4. ⚠️ Database table (need to create)
5. ⚠️ Environment variables (need to set)

---

## 🚀 Quick Fix (5 Steps)

### Step 1: Install Supabase CLI

**Option A: Using Scoop (Recommended for Windows)**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option B: Using npm**
```powershell
npm install -g supabase
```

Verify installation:
```powershell
supabase --version
```

---

### Step 2: Login to Supabase

```powershell
supabase login
```

This will open your browser to authenticate. Follow the prompts.

---

### Step 3: Create Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `setup-database.sql` (in your project root)
5. Click **Run** or press `Ctrl+Enter`

You should see: `kv_store_a784a06a table created successfully!`

---

### Step 4: Set Environment Variables

1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/settings/api
2. Copy your keys:
   - **Project URL**: `https://tnlceozwrkspncxwcaqe.supabase.co`
   - **anon public key**: (long string starting with `eyJ...`)
   - **service_role key**: (long string starting with `eyJ...`)

3. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/functions
4. Click on `make-server-a784a06a` (if it exists) or you'll create it in the next step
5. Click **Settings** tab
6. Under **Secrets**, add these 3 variables:

```
SUPABASE_URL = https://tnlceozwrkspncxwcaqe.supabase.co
SUPABASE_ANON_KEY = <paste your anon key>
SUPABASE_SERVICE_ROLE_KEY = <paste your service_role key>
```

7. Click **Save**

---

### Step 5: Deploy the Edge Function

**Option A: Using the PowerShell script (easiest)**
```powershell
cd "c:\Users\mauro\Downloads\Dutch Learning App"
.\deploy-edge-function.ps1
```

**Option B: Manual deployment**
```powershell
cd "c:\Users\mauro\Downloads\Dutch Learning App"
supabase functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe
```

Wait for deployment to complete (usually 10-30 seconds).

---

## ✅ Verify It Works

### Test 1: Health Check

Open this URL in your browser:
```
https://tnlceozwrkspncxwcaqe.supabase.co/functions/v1/make-server-a784a06a/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T...",
  "message": "Dutch Learning App API is running"
}
```

### Test 2: Diagnostic Tool

Go back to your app and click **"Run Diagnostics"** again. All checks should now pass:
- ✅ Edge Function Health
- ✅ CORS Configuration
- ✅ Environment Variables
- ✅ Database Table

---

## 🐛 Troubleshooting

### Problem: "supabase: command not found"

**Solution**: The CLI isn't installed or not in PATH
- Try Option B (npm install) instead of Scoop
- Restart your terminal after installation

---

### Problem: "Failed to deploy: unauthorized"

**Solution**: You're not logged in
```powershell
supabase login
```

---

### Problem: "Project not linked"

**Solution**: Link your project explicitly
```powershell
supabase link --project-ref tnlceozwrkspncxwcaqe
```

---

### Problem: Still getting 404 after deployment

**Possible causes**:
1. Environment variables not set correctly
   - Go back to Step 4 and double-check all 3 variables
   - Make sure there are no extra spaces
   - Click Save and wait a moment

2. Function name mismatch
   - The function MUST be named exactly: `make-server-a784a06a`
   - Check in Supabase Dashboard → Functions

3. Database table doesn't exist
   - Run the SQL script again (Step 3)
   - Verify in Dashboard → Database → Tables

4. Need to redeploy after setting env vars
```powershell
supabase functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe
```

---

### Problem: CORS errors in browser

**Solution**: Clear browser cache and reload
- Press `Ctrl+Shift+R` to hard reload
- Or clear site data in browser settings

---

## 📊 View Logs

To see what's happening in your edge function:

```powershell
supabase functions logs make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe
```

Or in the Dashboard:
1. Go to Functions → make-server-a784a06a
2. Click **Logs** tab

---

## 🎯 What the Files Do

- **`supabase/functions/make-server-a784a06a/index.ts`**: The main edge function code
- **`supabase/functions/make-server-a784a06a/deno.json`**: Dependencies configuration
- **`setup-database.sql`**: Creates the database table
- **`deploy-edge-function.ps1`**: Automated deployment script
- **`DEPLOYMENT_INSTRUCTIONS.md`**: Detailed reference guide

---

## 🎓 Understanding the Architecture

Your app uses:
- **Frontend**: React app (served by Vite)
- **Backend**: Supabase Edge Function (Deno runtime)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Key-value pairs in `kv_store_a784a06a` table

The edge function provides:
- User authentication (signup/login)
- CRUD operations for classes, tests, vocabulary
- Progress tracking
- Mistake bank
- Spaced repetition system

---

## 🔐 Security Notes

- **Service Role Key**: Keep this SECRET! Never commit to Git
- The function uses service role for admin operations
- Row Level Security (RLS) is enabled on the KV table
- Only the edge function (via service role) can access the data

---

## ℹ️ Need More Help?

1. Check the logs: `supabase functions logs make-server-a784a06a`
2. Review Supabase docs: https://supabase.com/docs/guides/functions
3. Check your Dashboard for any alerts or issues
4. Verify all environment variables are set correctly

---

## ✨ After Successful Deployment

Your app features will work:
- 👤 User signup/login
- 📚 Creating and managing classes
- 📝 Taking tests and quizzes
- 💡 Vocabulary management
- 📊 Progress tracking
- 🧠 Spaced repetition
- ❌ Mistake bank

Good luck! 🚀
