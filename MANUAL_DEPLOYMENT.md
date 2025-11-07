# 🚀 Manual Deployment Instructions (No CLI Login Needed)

Since we're having issues with the CLI version, we can deploy directly using your Supabase access token.

## Step 1: Get Your Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Give it a name like "CLI Deployment"
4. Copy the token (starts with `sbp_...`)

## Step 2: Save Your Token

In PowerShell, run:
```powershell
$env:SUPABASE_ACCESS_TOKEN = "your-token-here"
```

Replace `your-token-here` with your actual token.

## Step 3: Create the Database Table

1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/sql/new
2. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS kv_store_a784a06a (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kv_store_a784a06a_key_prefix_idx 
  ON kv_store_a784a06a 
  USING btree (key text_pattern_ops);

ALTER TABLE kv_store_a784a06a ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access" 
  ON kv_store_a784a06a
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

3. Click **Run** (or Ctrl+Enter)

## Step 4: Set Environment Variables

1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/settings/api
2. Copy your keys:
   - **URL**: `https://tnlceozwrkspncxwcaqe.supabase.co`
   - **anon public**: The `anon` key
   - **service_role**: The `service_role` key

3. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/functions
4. If `make-server-a784a06a` exists, click it. Otherwise, you'll create it in the next step.
5. Click **Settings** tab → **Secrets**
6. Add these 3 secrets:

```
SUPABASE_URL = https://tnlceozwrkspncxwcaqe.supabase.co
SUPABASE_ANON_KEY = <your-anon-key>
SUPABASE_SERVICE_ROLE_KEY = <your-service-role-key>
```

## Step 5: Deploy Using the CLI

In PowerShell, run:

```powershell
.\supabase.exe functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe
```

If it asks for login, use:

```powershell
.\supabase.exe functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe --token $env:SUPABASE_ACCESS_TOKEN
```

## Step 6: Test

Open in your browser:
```
https://tnlceozwrkspncxwcaqe.supabase.co/functions/v1/make-server-a784a06a/health
```

You should see:
```json
{"status":"ok","timestamp":"...","message":"Dutch Learning App API is running"}
```

## Alternative: Deploy via Dashboard (If CLI fails)

If the CLI continues to have issues:

1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/functions
2. Click **"Create Function"**
3. Name it: `make-server-a784a06a`
4. Copy the content from: `supabase\functions\make-server-a784a06a\index.ts`
5. Paste it into the editor
6. Click **Deploy**

---

## Quick Commands Reference

```powershell
# Set your access token (do this once)
$env:SUPABASE_ACCESS_TOKEN = "sbp_your_token_here"

# Deploy the function
.\supabase.exe functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe --token $env:SUPABASE_ACCESS_TOKEN

# View logs
.\supabase.exe functions logs make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe --token $env:SUPABASE_ACCESS_TOKEN
```

---

Once deployed, go back to your app and click **"Run Diagnostics"** - everything should be green! ✅
