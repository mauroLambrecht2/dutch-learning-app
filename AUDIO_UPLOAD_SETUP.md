# Audio Upload Setup Guide

## Problem
Audio recordings were showing as "uploaded" in the UI, but weren't actually being saved to Supabase Storage. The system was using placeholder URLs that don't resolve.

## Solution
Implemented proper Supabase Storage integration for audio uploads.

## Setup Required

### 1. Create Supabase Storage Bucket

You need to create a storage bucket in your Supabase project:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `audio-recordings`
   - **Public bucket**: ✅ **YES** (check this box)
   - **File size limit**: 50 MB (or as needed)
   - **Allowed MIME types**: `audio/*` (or leave empty for all types)
5. Click **"Create bucket"**

### 2. Set Bucket Policies (Important!)

After creating the bucket, you need to set up policies to allow uploads:

1. Click on the `audio-recordings` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Create two policies:

#### Policy 1: Allow Authenticated Users to Upload
```sql
-- Policy name: Allow authenticated uploads
-- Allowed operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings' AND
  (storage.foldername(name))[1] = 'recordings'
);
```

#### Policy 2: Allow Public Read Access
```sql
-- Policy name: Allow public read
-- Allowed operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-recordings');
```

Or use the UI to create policies:
- **Policy 1 (Upload)**:
  - Operation: INSERT
  - Policy definition: `bucket_id = 'audio-recordings'`
  - Target roles: authenticated

- **Policy 2 (Read)**:
  - Operation: SELECT  
  - Policy definition: `bucket_id = 'audio-recordings'`
  - Target roles: public, authenticated

### 3. Verify Setup

Test the upload by:
1. Sign in to your app
2. Go to a lesson with audio recording
3. Record some audio
4. Click save
5. Check the Supabase Storage bucket - you should see the file under `recordings/`

## Code Changes Made

### Updated `src/utils/api.ts`

**Before** (Placeholder):
```typescript
async uploadAudio(accessToken: string, audioBlob: Blob, filename: string) {
  return {
    url: `https://placeholder-audio-url.com/${filename}`,
    success: true
  };
}
```

**After** (Real Upload):
```typescript
async uploadAudio(accessToken: string, audioBlob: Blob, filename: string) {
  try {
    const { supabase } = await import('./supabase-client');
    
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

## How It Works Now

1. **User records audio** → Creates blob in browser memory
2. **User clicks save** → Converts blob to File object
3. **Upload to Supabase** → Uploads to `audio-recordings/recordings/` folder
4. **Get public URL** → Returns permanent URL to the file
5. **Save URL** → Stores URL in lesson data
6. **Playback** → Audio plays from Supabase CDN

## File Structure in Storage

```
audio-recordings/
└── recordings/
    ├── audio-1762671234567.webm
    ├── audio-1762671234568.webm
    └── audio-1762671234569.webm
```

## Error Handling

The system now properly handles errors:

- ✅ Shows error message if upload fails
- ✅ Doesn't save placeholder URLs
- ✅ User can retry upload
- ✅ Console logs detailed error information

## Common Issues & Solutions

### Issue: "Upload failed: new row violates row-level security policy"
**Solution**: Make sure you created the INSERT policy for authenticated users (see Policy 1 above)

### Issue: "Audio files not playing"
**Solution**: 
1. Check bucket is set to **Public**
2. Verify the SELECT policy exists (Policy 2 above)
3. Check the file was actually uploaded in Storage dashboard

### Issue: "Failed to load resource: net::ERR_NAME_NOT_RESOLVED"
**Solution**: This means the bucket doesn't exist or isn't set up. Follow the setup steps above.

## Testing Checklist

- [ ] Supabase Storage bucket `audio-recordings` created
- [ ] Bucket set to **Public**
- [ ] INSERT policy created for authenticated users
- [ ] SELECT policy created for public access
- [ ] Test recording audio in app
- [ ] Verify file appears in Storage dashboard
- [ ] Test playing back the audio
- [ ] Check audio URL is from Supabase (not placeholder)

## Benefits

✅ **Real Storage**: Audio files are actually saved  
✅ **Permanent URLs**: Files persist and can be played back  
✅ **CDN Delivery**: Fast audio playback via Supabase CDN  
✅ **Error Feedback**: Users know if upload fails  
✅ **Scalable**: Can handle many audio files  

## Next Steps

After setup:
1. Test audio recording and playback
2. Monitor storage usage in Supabase dashboard
3. Consider adding file size limits if needed
4. Optionally add audio compression before upload
