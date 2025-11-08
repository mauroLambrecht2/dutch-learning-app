import { useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';

interface VocabularyCleanupToolProps {
  accessToken: string;
  onComplete: () => void;
}

export function VocabularyCleanupTool({ accessToken, onComplete }: VocabularyCleanupToolProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [duplicatesFound, setDuplicatesFound] = useState<any[]>([]);
  const [removedCount, setRemovedCount] = useState(0);

  const findAndRemoveDuplicates = async () => {
    setStatus('running');
    setMessage('Scanning for duplicates...');
    setDuplicatesFound([]);
    setRemovedCount(0);

    try {
      // Load all vocabulary
      const vocabulary = await api.getVocabulary(accessToken);
      
      // Find duplicates (case-insensitive)
      const seen = new Map<string, any>();
      const duplicates: any[] = [];

      for (const word of vocabulary) {
        const key = `${word.dutch.toLowerCase()}|${word.english.toLowerCase()}`;
        
        if (seen.has(key)) {
          // This is a duplicate
          duplicates.push({
            id: word.id,
            dutch: word.dutch,
            english: word.english,
            original: seen.get(key)
          });
        } else {
          seen.set(key, word);
        }
      }

      setDuplicatesFound(duplicates);

      if (duplicates.length === 0) {
        setStatus('success');
        setMessage('No duplicates found! Your vocabulary is clean.');
        return;
      }

      setMessage(`Found ${duplicates.length} duplicates. Removing...`);

      // Remove duplicates
      for (const dup of duplicates) {
        await api.deleteVocabulary(accessToken, dup.id);
      }

      setRemovedCount(duplicates.length);
      setStatus('success');
      setMessage(`Successfully removed ${duplicates.length} duplicate words!`);
      
      // Refresh the vocabulary list
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      setStatus('error');
      setMessage(`Cleanup failed: ${error}`);
      console.error('Cleanup error:', error);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-2">
          Remove Duplicate Vocabulary
        </h3>
        <p className="text-xs text-zinc-600">
          This tool will scan your vocabulary library and remove duplicate words (keeping the first occurrence).
        </p>
      </div>

      {status === 'idle' && (
        <Button 
          onClick={findAndRemoveDuplicates} 
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Scan & Remove Duplicates
        </Button>
      )}

      {status === 'running' && (
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
          {removedCount > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
              ✓ Removed {removedCount} duplicate {removedCount === 1 ? 'word' : 'words'}
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {duplicatesFound.length > 0 && status === 'running' && (
        <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-zinc-700 mb-2">
            Duplicates being removed:
          </div>
          <div className="space-y-1">
            {duplicatesFound.slice(0, 10).map((dup, i) => (
              <div key={i} className="text-xs text-zinc-600">
                • {dup.dutch} → {dup.english}
              </div>
            ))}
            {duplicatesFound.length > 10 && (
              <div className="text-xs text-zinc-400 italic">
                ... and {duplicatesFound.length - 10} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
