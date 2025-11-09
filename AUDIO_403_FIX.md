# Audio Upload 403 Error - Quick Fix

## Problem
Getting 403 error when trying to upload audio, even though the bucket exists and was working before.

## Likely Causes

### 1. Bucket Policies Changed or Missing
The RLS (Row Level Security) policies might have been reset or modified.

### 2. Bucket Not Public
The bucket might have been changed from Public to Private.

### 3. Authentication Token Issue
The access token might not be properly passed or validated.

## Quick Fix Steps

### Step 1: Check Bucket is Public
1. Go to: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/storage/buckets
2. Find `audio-recordings` bucket
3. Click the three dots (⋮) → **Edit**
4. Make sure **"Public bucket"** is checked ✅
5. Click **Save**

### Step 2: Verify/Recreate Policies

Go to the bucket → **Policies** tab

#### Policy 1: Allow Authenticated Uploads
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings'
);
```

#### Policy 2: Allow Public Read
```sql
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-recordings');
```

### Step 3: Test Upload

1. Sign in to the app
2. Try recording audio
3. Check browser console for detailed error
4. Check Supabase Storage dashboard to see if file appears

## Alternative: Use Service Role Key (Temporary)

If policies are complex, you can temporarily use the service role key for uploads:

**In `src/utils/api.ts`**:
```typescript
async uploadAudio(accessToken: string, audioBlob: Blob, filename: string) {
  try {
    // Use service role key for admin access (bypasses RLS)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = 'https://tnlceozwrkspncxwcaqe.supabase.co';
    const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY'; // Get from Supabase dashboard
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .upload(`recordings/${filename}`, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-recordings')
      .getPublicUrl(`recordings/${filename}`);

    return {
      url: urlData.publicUrl,
      success: true
    };
  } catch (error) {
    console.error('Audio upload error:', error);
    throw error;
  }
}
```

⚠️ **Note**: Using service role key bypasses all security. Only use for testing!

## Check Current Status

Run this in browser console while signed in:
```javascript
// Check if user is authenticated
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Access Token:', session?.access_token);

// Try to list files in bucket
const { data, error } = await supabase.storage
  .from('audio-recordings')
  .list('recordings');
console.log('List result:', { data, error });
```

## Expected Behavior

### Working Upload
```
1. User records audio
2. Blob created: audio-1762671234567.webm
3. Upload starts...
4. ✅ Upload successful
5. URL: https://tnlceozwrkspncxwcaqe.supabase.co/storage/v1/object/public/audio-recordings/recordings/audio-1762671234567.webm
6. Audio plays
```

### 403 Error
```
1. User records audio
2. Blob created: audio-1762671234567.webm
3. Upload starts...
4. ❌ 403 Forbidden
5. Error: "new row violates row-level security policy"
   OR "Bucket not found"
   OR "Unauthorized"
```

## Most Common Fix

**99% of the time, it's the INSERT policy missing or incorrect.**

Quick fix:
1. Go to Storage → audio-recordings → Policies
2. Delete all existing policies
3. Click "New Policy"
4. Select "Allow INSERT for authenticated users"
5. Click "Review" → "Save"
6. Click "New Policy" again
7. Select "Allow SELECT for all users"
8. Click "Review" → "Save"

That should fix it!

## Still Not Working?

Check these:
- [ ] Bucket name is exactly `audio-recordings` (no typos)
- [ ] Bucket is set to Public
- [ ] User is actually authenticated (check session in console)
- [ ] Access token is being passed correctly
- [ ] No CORS errors in console
- [ ] Supabase project is not paused/suspended

## Need More Help?

Share the exact error message from the console:
```
AudioRecorder.tsx:92 Error uploading audio: Error: [EXACT ERROR HERE]
```

This will help diagnose the specific issue!
