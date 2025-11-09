# Create Audio Storage Bucket - Quick Guide

## Error You're Seeing
```
StorageApiError: Bucket not found
POST https://tnlceozwrkspncxwcaqe.supabase.co/storage/v1/object/audio-recordings/recordings/undefined 400
```

## Solution: Create the Bucket

### Option 1: Using Supabase Dashboard (Easiest - 2 minutes)

1. **Open Supabase Storage**:
   - Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/storage/buckets

2. **Click "New bucket"** button (top right)

3. **Fill in the form**:
   ```
   Name: audio-recordings
   Public bucket: ✅ YES (check this!)
   File size limit: 50 MB
   Allowed MIME types: (leave empty or add: audio/*)
   ```

4. **Click "Create bucket"**

5. **Set up policies** (click on the bucket → Policies tab):
   
   **Policy 1 - Allow Upload**:
   - Click "New Policy"
   - Template: "Custom"
   - Policy name: `Allow authenticated uploads`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - USING expression: `true`
   - WITH CHECK expression: `bucket_id = 'audio-recordings'`
   - Click "Save"

   **Policy 2 - Allow Read**:
   - Click "New Policy"  
   - Template: "Custom"
   - Policy name: `Allow public read`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `bucket_id = 'audio-recordings'`
   - Click "Save"

### Option 2: Using SQL (Advanced)

Run this in the Supabase SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true);

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-recordings');

-- Allow everyone to read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-recordings');
```

## Verify It Works

After creating the bucket:

1. Refresh your app
2. Try recording audio again
3. Click save
4. Go to Storage in Supabase dashboard
5. You should see your audio file in `audio-recordings/recordings/`

## What Was Fixed in Code

**Fixed the filename issue**:
```typescript
// Before (wrong - only 2 params)
const result = await api.uploadAudio(accessToken, file);

// After (correct - 3 params)
const result = await api.uploadAudio(accessToken, blob, fileName);
```

Now the filename is passed correctly and won't be `undefined`.

## Quick Test

After setup, you should see:
- ✅ No more "Bucket not found" error
- ✅ Files appear in Storage dashboard
- ✅ Audio plays back correctly
- ✅ URLs look like: `https://tnlceozwrkspncxwcaqe.supabase.co/storage/v1/object/public/audio-recordings/recordings/audio-1234567890.webm`

## Troubleshooting

**Still getting "Bucket not found"?**
- Make sure bucket name is exactly `audio-recordings` (with hyphen, not underscore)
- Check you're in the right Supabase project
- Try refreshing the page

**Upload works but can't play audio?**
- Make sure bucket is set to **Public**
- Check the SELECT policy exists
- Verify the file actually uploaded (check Storage dashboard)

**Permission denied?**
- Make sure INSERT policy exists for authenticated users
- Check you're signed in
- Verify the policy's WITH CHECK expression is correct
