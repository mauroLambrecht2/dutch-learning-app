# Audio Storage Setup Guide

## Problem
The audio recordings were being saved as temporary blob URLs that don't persist. Now they're being uploaded to Supabase Storage for permanent storage.

## Setup Required

### 1. Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **New bucket**
5. Create a bucket with these settings:
   - **Name**: `vocabulary-audio`
   - **Public bucket**: ✅ Yes (check this box)
   - Click **Create bucket**

### 2. Set Bucket Policies (Optional but Recommended)

To allow authenticated users to upload:

1. Click on the `vocabulary-audio` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For full customization**
5. Add this policy for INSERT (upload):

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vocabulary-audio');
```

6. Add this policy for SELECT (read):

```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vocabulary-audio');
```

## How It Works Now

1. **Admin records audio** → AudioRecorder component
2. **Audio is uploaded** → Supabase Storage (`vocabulary-audio/recordings/`)
3. **Public URL is saved** → Stored in vocabulary word data
4. **Students can play** → Audio loads from permanent URL

## File Structure

Audio files are stored as:
```
vocabulary-audio/
  └── recordings/
      ├── audio-1234567890.webm
      ├── audio-1234567891.webm
      └── ...
```

## Testing

1. Go to Vocabulary Manager (admin side)
2. Record audio for a word
3. Click "Save Audio"
4. You should see "Uploading..." then success
5. Go to student side and play the audio
6. Audio should play without errors

## Troubleshooting

### Error: "Failed to upload audio"
- Check that the `vocabulary-audio` bucket exists
- Check that it's set to **public**
- Check browser console for detailed error

### Error: "Failed to load resource"
- The bucket might not be public
- Go to Storage → vocabulary-audio → Configuration
- Enable "Public bucket"

### Audio doesn't play
- Check the audioUrl in the database
- It should start with: `https://tnlceozwrkspncxwcaqe.supabase.co/storage/v1/object/public/vocabulary-audio/`
- If it starts with `blob:`, the old code is still running - refresh the page

## Benefits

✅ Audio persists across sessions
✅ Students can access audio anytime
✅ Audio works in lessons, flashcards, and vocabulary list
✅ Centralized storage management
