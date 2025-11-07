# 🚀 Deployment Guide - Dutch Learning App

## Current Status

Your app is fully built with:
- ✅ 31 functional API endpoints
- ✅ Complete React frontend with all components
- ✅ Supabase credentials configured
- ❌ Edge function needs deployment
- ❌ Database tables need creation
- ❌ User accounts need setup

## 🔧 Steps to Fix the Errors

### Step 1: Deploy the Edge Function

The edge function at `/supabase/functions/server/index.tsx` needs to be deployed to your Supabase project.

**Option A: Using Supabase CLI (Recommended)**

1. Install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref tnlceozwrkspncxwcaqe
   ```

4. Deploy the edge function:
   ```bash
   supabase functions deploy server
   ```

**Option B: Using Supabase Dashboard**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe
2. Navigate to "Edge Functions" in the left sidebar
3. Click "New Function"
4. Name it: `make-server-a784a06a`
5. Copy the contents of `/supabase/functions/server/index.tsx` and paste it
6. Click "Deploy"

### Step 2: Create the Database Table

The edge function uses a key-value store table. You need to create it:

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
CREATE TABLE kv_store_a784a06a (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Add index for prefix searches
CREATE INDEX idx_kv_store_key_prefix ON kv_store_a784a06a USING btree (key text_pattern_ops);
```

### Step 3: Set Environment Variables

Your edge function needs these environment variables:

1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add these secrets:

```
SUPABASE_URL=https://tnlceozwrkspncxwcaqe.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGNlb3p3cmtzcG5jeHdjYXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTI4NDYsImV4cCI6MjA3ODAyODg0Nn0.iY7t1j9I0cXr6cAYX2vgF-eV1HTj_T_TJRKIfHpsCV8
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-project-settings>
```

⚠️ **Important**: Get the `SUPABASE_SERVICE_ROLE_KEY` from:
- Dashboard → Settings → API → Service Role Key (keep this secret!)

### Step 4: Create User Accounts

Create the two user accounts for authentication:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"

**Teacher Account (Mauro):**
- Email: `creator@dutch.app`
- Password: `creator-secure-2024-dutch`
- ✅ Enable "Auto Confirm User"
- User Metadata (JSON):
  ```json
  {
    "name": "Mauro",
    "role": "teacher"
  }
  ```

**Student Account (Xindy):**
- Email: `learner@dutch.app`
- Password: `learner-secure-2024-dutch`
- ✅ Enable "Auto Confirm User"
- User Metadata (JSON):
  ```json
  {
    "name": "Xindy",
    "role": "student"
  }
  ```

### Step 5: Test the Connection

1. Click the "🔧 Check Connection" button in the top-right of the app
2. This will test if the edge function is responding
3. If successful, you should see "Connected successfully!"

### Step 6: Enable Storage (Optional - For Audio)

If you want audio recording to work:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `audio`
3. Set it to public or configure RLS policies as needed

## 🐛 Troubleshooting

### Error: "Failed to fetch vocabulary/tests/results"

**Cause**: Edge function not deployed or database table missing

**Solution**: Complete Steps 1-3 above

### Error: "403 Forbidden" when deploying

**Cause**: Insufficient permissions or project not linked

**Solution**: 
- Make sure you're logged into Supabase CLI with the correct account
- Verify you have owner/admin access to the project
- Try relinking: `supabase link --project-ref tnlceozwrkspncxwcaqe`

### Error: "Invalid login credentials"

**Cause**: User accounts haven't been created

**Solution**: Complete Step 4 above

### Error: "Email not confirmed"

**Cause**: Forgot to check "Auto Confirm User" when creating accounts

**Solution**: 
- Go to Authentication → Users
- Find the user and click "..."
- Select "Confirm email"

### Edge function deploys but doesn't work

**Cause**: Missing environment variables

**Solution**: 
- Verify all three environment variables are set (Step 3)
- Redeploy the edge function after adding variables

### Database queries fail

**Cause**: KV store table not created

**Solution**: Run the SQL from Step 2

## 📊 Verifying Everything Works

Once deployed, test these endpoints:

1. **Health Check**: `https://tnlceozwrkspncxwcaqe.supabase.co/functions/v1/make-server-a784a06a/health`
   - Should return: `{"status":"ok"}`

2. **Login as Teacher**: Select "I'm Mauro (Creator)" in the app

3. **Create a Lesson**: Test the lesson builder

4. **Login as Student**: Select "I'm Xindy (Learner)" in the app

5. **View Lessons**: Check if lessons appear in student view

## 🎯 Quick Start Checklist

- [ ] Deploy edge function
- [ ] Create database table
- [ ] Set environment variables
- [ ] Create teacher account
- [ ] Create student account
- [ ] Test connection
- [ ] Login and verify both views work

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Authentication Setup Guide](./AUTH_SETUP.md)
- [API Documentation](./BACKEND_API_DOCUMENTATION.md)

## 🆘 Still Having Issues?

1. Check the Supabase function logs: Dashboard → Edge Functions → Logs
2. Check browser console for detailed error messages
3. Use the "🔧 Check Connection" button to diagnose
4. Review the error messages in the connection status page

---

**Next Steps After Deployment:**

Once everything is working:
1. Start creating lessons in the teacher view
2. Test the student learning experience
3. Explore all the interactive exercise types
4. Set up audio recordings for vocabulary
5. Create tests and track progress
