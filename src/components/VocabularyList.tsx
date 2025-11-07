import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Volume2, BookOpen, Shuffle } from 'lucide-react';

interface VocabularyListProps {
  accessToken: string;
}

interface VocabularyWord {
  dutch: string;
  english: string;
  learnedAt: string;
  classId: string;
}

export function VocabularyList({ accessToken }: VocabularyListProps) {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [testWords, setTestWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const response = await fetch(`https://tnlceozwrkspncxwcaqe.supabase.co/functions/v1/make-server-a784a06a/progress`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVocabulary(data.vocabulary || []);
      }
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    }
  };

  const filteredVocabulary = vocabulary.filter(word =>
    word.dutch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startTest = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setTestWords(shuffled);
    setCurrentTestIndex(0);
    setShowAnswer(false);
    setIsTestMode(true);
  };

  const nextWord = () => {
    if (currentTestIndex < testWords.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
      setShowAnswer(false);
    } else {
      setIsTestMode(false);
    }
  };

  if (isTestMode) {
    const currentWord = testWords[currentTestIndex];
    
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-zinc-50">
        <div className="max-w-2xl w-full">
          <div className="mb-8 text-center">
            <div className="text-sm text-zinc-500 mb-2">
              Word {currentTestIndex + 1} of {testWords.length}
            </div>
            <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${((currentTestIndex + 1) / testWords.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border-2 border-zinc-200 p-12 text-center">
            <div className="text-5xl text-zinc-900 mb-8" style={{ fontWeight: 700 }}>
              {currentWord.dutch}
            </div>
            
            {showAnswer && (
              <div className="mt-8 pt-8 border-t border-zinc-200">
                <div className="text-sm text-zinc-500 mb-2">Translation:</div>
                <div className="text-3xl text-indigo-600" style={{ fontWeight: 600 }}>
                  {currentWord.english}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            {!showAnswer ? (
              <Button
                onClick={() => setShowAnswer(true)}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Show Answer
              </Button>
            ) : (
              <>
                <Button
                  onClick={nextWord}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {currentTestIndex < testWords.length - 1 ? 'Next Word' : 'Finish Test'}
                </Button>
              </>
            )}
            <Button
              onClick={() => setIsTestMode(false)}
              size="lg"
              variant="outline"
            >
              Exit Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-zinc-900 mb-1" style={{ fontWeight: 700 }}>
            My Vocabulary
          </h2>
          <p className="text-sm text-zinc-500">
            {vocabulary.length} {vocabulary.length === 1 ? 'word' : 'words'} learned
          </p>
        </div>
        <Button
          onClick={startTest}
          disabled={vocabulary.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Test Yourself
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search vocabulary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vocabulary Table */}
      {filteredVocabulary.length === 0 ? (
        <div className="bg-white border border-zinc-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
            {searchQuery ? 'No matching words' : 'No vocabulary yet'}
          </h3>
          <p className="text-sm text-zinc-500">
            {searchQuery 
              ? 'Try a different search term'
              : 'Complete lessons to learn new words'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-zinc-500" style={{ fontWeight: 600 }}>
                  DUTCH
                </th>
                <th className="text-left px-6 py-3 text-xs text-zinc-500" style={{ fontWeight: 600 }}>
                  ENGLISH
                </th>
                <th className="text-left px-6 py-3 text-xs text-zinc-500" style={{ fontWeight: 600 }}>
                  LEARNED
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredVocabulary.map((word, index) => (
                <tr key={index} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-zinc-900" style={{ fontWeight: 600 }}>
                        {word.dutch}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {word.english}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(word.learnedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
