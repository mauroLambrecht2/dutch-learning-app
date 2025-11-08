# Audio in Exercises - Quick Guide

## Problem Solved
Audio wasn't showing in flashcards, multiple choice, fill-in-blank, and matching exercises because the exercises were created manually without audio URLs.

## Solution
Added "Load from Vocabulary" buttons that automatically populate exercises with words from your Vocabulary Manager, including their audio recordings.

## How to Use

### Step 1: Add Audio to Vocabulary Words
1. Go to **Vocabulary Manager** (admin side)
2. For each word, click **Record** button
3. Record the pronunciation
4. Click **Save Audio**
5. The audio URL is now stored with that word

### Step 2: Create Lesson with Audio
1. Go to **Lesson Builder**
2. Add a page (Flashcards, Multiple Choice, Fill-in-Blank, or Matching)
3. Click the **"Load from Vocabulary"** button
4. All your vocabulary words will be imported WITH their audio URLs
5. Save the lesson

### Step 3: Students See Audio
When students take the lesson, they'll see a speaker icon (🔊) next to words that have audio. Clicking it plays the pronunciation.

## Where Audio Appears

### ✅ Vocabulary Page
- Shows audio button next to Dutch words

### ✅ Flashcards
- Shows audio button on the front (Dutch side)

### ✅ Multiple Choice
- Shows audio button next to the question

### ✅ Fill-in-Blank
- Shows audio button at the top of each exercise

### ✅ Matching
- Shows audio button next to each Dutch word (left side)

## Important Notes

1. **Audio must be recorded first** in Vocabulary Manager
2. Use **"Load from Vocabulary"** button to import words with audio
3. Manually created exercises won't have audio unless you add it
4. The audio bucket must be created in Supabase (see AUDIO_STORAGE_SETUP.md)

## Tips

- Record audio for all vocabulary words before creating lessons
- Use "Load from Vocabulary" to save time and ensure audio is included
- You can edit the imported exercises after loading them
- For Multiple Choice, you'll need to add the other 3 options manually after importing

## Troubleshooting

### No audio button showing
- Check that the word has audio in Vocabulary Manager
- Make sure you used "Load from Vocabulary" button
- Verify the audioUrl field is populated in the exercise data

### Audio doesn't play
- Check browser console for errors
- Verify the Supabase storage bucket is public
- Test the audio URL directly in a browser

### "Load from Vocabulary" shows no words
- Add words in Vocabulary Manager first
- Refresh the page and try again
