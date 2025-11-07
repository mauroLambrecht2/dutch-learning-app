# Edge Function Deployment Instructions

## ✅ Steps to Fix the 404 Error

### 1. Create the Database Table

Go to your Supabase Dashboard → SQL Editor and run:

```sql
CREATE TABLE IF NOT EXISTS kv_store_a784a06a (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE kv_store_a784a06a ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role has full access" ON kv_store_a784a06a
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### 2. Install Supabase CLI

If you haven't already:

```powershell
# Install via Scoop (recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or via npm
npm install -g supabase
```

### 3. Login to Supabase

```powershell
supabase login
```

### 4. Link Your Project

```powershell
# From your project root directory
cd "c:\Users\mauro\Downloads\Dutch Learning App"

# Link to your project
supabase link --project-ref tnlceozwrkspncxwcaqe
```

### 5. Set Environment Variables

Go to Supabase Dashboard → Edge Functions → `make-server-a784a06a` → Settings

Add these environment variables:

```
SUPABASE_URL=https://tnlceozwrkspncxwcaqe.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**To get your keys:**
- Supabase Dashboard → Settings → API
- Copy the `anon` and `service_role` keys

### 6. Deploy the Edge Function

```powershell
# From your project root
supabase functions deploy make-server-a784a06a
```

### 7. Verify Deployment

Test the health endpoint in your browser or with curl:

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

## 🔍 Troubleshooting

### If you get "function not found":
1. Make sure the function is deployed: `supabase functions list`
2. Check the function name matches exactly: `make-server-a784a06a`

### If you get CORS errors:
- The function already has CORS configured for `*` origin
- Clear your browser cache
- Make sure you're using the correct URL format

### If environment variables are missing:
1. Go to Dashboard → Edge Functions → make-server-a784a06a → Settings
2. Add all three environment variables listed above
3. Click "Save"
4. Redeploy: `supabase functions deploy make-server-a784a06a`

### To view logs:
```powershell
supabase functions logs make-server-a784a06a
```

### To test locally (optional):
```powershell
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve make-server-a784a06a
```

## 📝 What Changed

I've created a properly structured edge function at:
- `supabase/functions/make-server-a784a06a/index.ts`
- `supabase/functions/make-server-a784a06a/deno.json`

The function includes:
- ✅ Health check endpoint at `/health`
- ✅ Full CORS support
- ✅ All API endpoints (auth, classes, tests, vocabulary, etc.)
- ✅ KV store using Postgres table instead of Deno KV
- ✅ Proper error handling and logging

## 🚀 After Deployment

Once deployed successfully, your diagnostic tool should show:
- ✅ Edge Function Health: OK
- ✅ CORS Configuration: Passed
- ✅ Environment Variables: OK
- ✅ Database Table: OK

Your app will then be fully functional!
