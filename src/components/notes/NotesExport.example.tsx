/**
 * Example usage of NotesExport component
 * 
 * This file demonstrates how to use the NotesExport component
 * in different scenarios.
 */

import { NotesExport } from './NotesExport';

// Example 1: Export a single note
export function ExportSingleNote() {
  return (
    <NotesExport
      accessToken="user-access-token"
      userId="user-123"
      options={{
        scope: 'single',
        noteId: 'note-456',
        includeVocabulary: true,
        includeClassInfo: true,
        format: 'pdf',
      }}
      onComplete={() => {
        console.log('Export completed!');
      }}
    />
  );
}

// Example 2: Export all notes from a topic
export function ExportTopicNotes() {
  return (
    <NotesExport
      accessToken="user-access-token"
      userId="user-123"
      options={{
        scope: 'topic',
        topicId: 'topic-789',
        includeVocabulary: true,
        includeClassInfo: true,
        format: 'pdf',
      }}
      onComplete={() => {
        console.log('Topic notes exported!');
      }}
    />
  );
}

// Example 3: Export all notes
export function ExportAllNotes() {
  return (
    <NotesExport
      accessToken="user-access-token"
      userId="user-123"
      options={{
        scope: 'all',
        includeVocabulary: false, // Exclude vocabulary
        includeClassInfo: true,
        format: 'pdf',
      }}
      onComplete={() => {
        console.log('All notes exported!');
      }}
    />
  );
}

// Example 4: Using in a dialog/modal
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

export function ExportNotesDialog({ accessToken, userId }: { accessToken: string; userId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Notes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <NotesExport
          accessToken={accessToken}
          userId={userId}
          options={{
            scope: 'all',
            includeVocabulary: true,
            includeClassInfo: true,
            format: 'pdf',
          }}
          onComplete={() => {
            console.log('Export completed, closing dialog...');
            // You can close the dialog here
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
