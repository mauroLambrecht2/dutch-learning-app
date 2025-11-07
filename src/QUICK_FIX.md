# ⚡ Quick Fix for API Errors

## The Problem
- ❌ Failed to load vocabulary
- ❌ Failed to load tests  
- ❌ Failed to load test results
- ❌ 403 error when deploying

## The Solution (5 Minutes)

### 1️⃣ Create Database Table
Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/sql

Click "New Query" and run:
```sql
CREATE TABLE kv_store_a784a06a (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX idx_kv_store_key_prefix ON kv_store_a784a06a USING btree (key text_pattern_ops);
```

### 2️⃣ Get Service Role Key
Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/settings/api

Copy the **Service Role Key** (keep this secret!)

### 3️⃣ Deploy Edge Function via CLI

```bash
# Install CLI (if needed)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref tnlceozwrkspncxwcaqe

# Set secrets
supabase secrets set SUPABASE_URL=https://tnlceozwrkspncxwcaqe.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGNlb3p3cmtzcG5jeHdjYXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTI4NDYsImV4cCI6MjA3ODAyODg0Nn0.iY7t1j9I0cXr6cAYX2vgF-eV1HTj_T_TJRKIfHpsCV8
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<paste-your-key-here>

# Deploy
cd supabase/functions
supabase functions deploy server
```

### 4️⃣ Create User Accounts
Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/auth/users

Click "Add User" → "Create New User"

**Teacher Account:**
- Email: `creator@dutch.app`
- Password: `creator-secure-2024-dutch`
- ✅ Auto Confirm User
- Metadata: `{"name": "Mauro", "role": "teacher"}`

**Student Account:**
- Email: `learner@dutch.app`  
- Password: `learner-secure-2024-dutch`
- ✅ Auto Confirm User
- Metadata: `{"name": "Xindy", "role": "student"}`

### 5️⃣ Test It
Open the app and click "🔧 Check Connection" to verify everything works!

---

## Alternative: Deploy via Dashboard

If you don't have CLI access:

1. Go to Edge Functions: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/functions
2. Create new function named: `server`
3. Copy ALL code from `/supabase/functions/server/index.tsx`
4. Add the three environment variables in function settings
5. Deploy

---

## Still Not Working?

Use the **Setup Wizard** in the app:
1. Click "📋 Setup Guide" button
2. Follow the step-by-step instructions
3. Use the copy buttons to grab code snippets
4. Click "Check Status" to verify

Or check **DEPLOYMENT_GUIDE.md** for detailed troubleshooting.
