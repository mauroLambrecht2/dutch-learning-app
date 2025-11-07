# ✅ Your Function is Deployed! Now Complete Setup

## Step 1: Create Database Table

1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/sql/new
2. Copy and paste this entire SQL script:

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

-- Verify
SELECT 'Table created successfully!' as status;
```

3. Click **RUN** (or press F5)

## Step 2: Set Environment Variables

1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/settings/api

2. **Copy these values:**
   - URL: `https://tnlceozwrkspncxwcaqe.supabase.co`
   - anon public key: (copy the long `eyJ...` string under "anon public")
   - service_role key: (copy the long `eyJ...` string under "service_role")

3. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/functions/make-server-a784a06a

4. Click the **Settings** tab

5. Scroll to **Secrets** section

6. Add these 3 secrets (click "+ New secret" for each):

   ```
   Name: SUPABASE_URL
   Value: https://tnlceozwrkspncxwcaqe.supabase.co
   ```

   ```
   Name: SUPABASE_ANON_KEY
   Value: <paste your anon key here>
   ```

   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: <paste your service_role key here>
   ```

7. Click **Save** after adding all three

## Step 3: Redeploy (to pick up the environment variables)

In PowerShell, run:

```powershell
.\supabase.exe functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe
```

## Step 4: Test

Open in your browser:
```
https://tnlceozwrkspncxwcaqe.supabase.co/functions/v1/make-server-a784a06a/health
```

You should see:
```json
{"status":"ok","timestamp":"2025-11-06T...","message":"Dutch Learning App API is running"}
```

## Step 5: Run Diagnostics in Your App

Go back to your app and click **"Run Diagnostics"** - all checks should pass! ✅

---

## Current Status:
✅ Supabase CLI installed (v2.54.11)
✅ Logged in
✅ Function deployed
⚠️ Need to create database table
⚠️ Need to set environment variables
