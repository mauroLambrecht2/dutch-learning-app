import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mic, Play, Trash2, Plus, Upload } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { VocabularyCleanupTool } from './VocabularyCleanupTool';

interface VocabularyWord {
  id: string;
  dutch: string;
  english: string;
  example?: string;
  audioUrl?: string;
  category?: string;
  lessonId?: string;
}

interface VocabularyManagerProps {
  accessToken: string;
}

export function VocabularyManager({ accessToken }: VocabularyManagerProps) {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [newWord, setNewWord] = useState({ dutch: '', english: '', example: '', category: '' });

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const data = await api.getVocabulary(accessToken);
      setWords(data || []);
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWord = async () => {
    if (!newWord.dutch || !newWord.english) {
      alert('Please enter both Dutch and English words');
      return;
    }

    try {
      await api.createVocabulary(accessToken, {
        ...newWord,
        id: `vocab-${Date.now()}`,
      });
      setNewWord({ dutch: '', english: '', example: '', category: '' });
      loadVocabulary();
    } catch (error) {
      alert('Failed to add word');
    }
  };

  const deleteWord = async (id: string) => {
    if (!confirm('Delete this word?')) return;
    
    try {
      await api.deleteVocabulary(accessToken, id);
      loadVocabulary();
    } catch (error) {
      alert('Failed to delete word');
    }
  };

  const handleAudioSaved = async (wordId: string, audioUrl: string) => {
    try {
      await api.updateVocabulary(accessToken, wordId, { audioUrl });
      loadVocabulary();
      setRecordingId(null);
    } catch (error) {
      alert('Failed to save audio');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-zinc-500">Loading vocabulary...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cleanup Tool */}
      <div className="bg-orange-50 border border-orange-200 p-4 rounded">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">
          🧹 Remove Duplicates
        </h3>
        <p className="text-xs text-orange-800 mb-3">
          If you have duplicate vocabulary words, use this tool to clean them up automatically.
        </p>
        <VocabularyCleanupTool accessToken={accessToken} onComplete={loadVocabulary} />
      </div>

      <div className="bg-white border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
            Vocabulary Library
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Manage all vocabulary words. Add audio pronunciations for each word.
          </p>
        </div>

        {/* Add New Word */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50">
        <h3 className="text-sm text-zinc-700 mb-4" style={{ fontWeight: 600 }}>
          Add New Word
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-zinc-600 mb-1.5 block">Dutch Word *</Label>
            <Input
              value={newWord.dutch}
              onChange={(e) => setNewWord({ ...newWord, dutch: e.target.value })}
              placeholder="hallo"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-600 mb-1.5 block">English Translation *</Label>
            <Input
              value={newWord.english}
              onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
              placeholder="hello"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-600 mb-1.5 block">Example Sentence</Label>
            <Input
              value={newWord.example}
              onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
              placeholder="Hallo, hoe gaat het?"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-600 mb-1.5 block">Category</Label>
            <Input
              value={newWord.category}
              onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
              placeholder="Greetings"
              className="text-sm"
            />
          </div>
        </div>
        <Button
          onClick={addWord}
          size="sm"
          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Word
        </Button>
      </div>

      {/* Word List */}
      <div className="divide-y divide-zinc-200">
        {words.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-400 mb-2">No vocabulary words yet</p>
            <p className="text-sm text-zinc-500">Add words above to build your vocabulary library</p>
          </div>
        ) : (
          words.map((word) => (
            <div key={word.id} className="p-4 hover:bg-zinc-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Dutch</div>
                    <div className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                      {word.dutch}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">English</div>
                    <div className="text-sm text-zinc-700">{word.english}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Example</div>
                    <div className="text-sm text-zinc-600">{word.example || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Category</div>
                    <div className="text-sm text-zinc-600">{word.category || 'Uncategorized'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {word.audioUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => new Audio(word.audioUrl).play()}
                      className="border-zinc-200"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRecordingId(word.id)}
                    className="border-zinc-200"
                  >
                    <Mic className="w-3 h-3 mr-1" />
                    {word.audioUrl ? 'Re-record' : 'Record'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteWord(word.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {recordingId === word.id && (
                <div className="mt-4 p-4 bg-zinc-100 border border-zinc-200">
                  <AudioRecorder
                    onSave={(audioUrl) => handleAudioSaved(word.id, audioUrl)}
                    onCancel={() => setRecordingId(null)}
                    accessToken={accessToken}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
