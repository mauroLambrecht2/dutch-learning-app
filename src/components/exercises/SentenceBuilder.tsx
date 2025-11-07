import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Check, RotateCcw, Shuffle } from 'lucide-react';

interface SentenceBuilderProps {
  correctSentence: string;
  hint?: string;
  onCorrect: () => void;
}

export function SentenceBuilder({ correctSentence, hint, onCorrect }: SentenceBuilderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const wordArray = correctSentence.split(' ');
    const shuffled = [...wordArray].sort(() => Math.random() - 0.5);
    setWords(wordArray);
    setAvailableWords(shuffled);
  }, [correctSentence]);

  const addWord = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
    setIsCorrect(null);
  };

  const removeWord = (index: number) => {
    const word = selectedWords[index];
    setAvailableWords([...availableWords, word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    const userSentence = selectedWords.join(' ');
    const correct = userSentence === correctSentence;
    setIsCorrect(correct);
    if (correct) {
      setTimeout(onCorrect, 1500);
    }
  };

  const reset = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsCorrect(null);
  };

  const shuffle = () => {
    setAvailableWords([...availableWords].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="space-y-6">
      {hint && (
        <div className="p-4 bg-yellow-50 border border-yellow-200">
          <div className="text-xs text-yellow-700 mb-1" style={{ fontWeight: 600 }}>
            HINT
          </div>
          <div className="text-sm text-yellow-800">{hint}</div>
        </div>
      )}

      {/* Built Sentence */}
      <div>
        <div className="text-sm text-zinc-600 mb-3" style={{ fontWeight: 500 }}>
          Build the sentence:
        </div>
        <div className="min-h-20 p-4 border-2 border-dashed border-zinc-300 bg-zinc-50">
          {selectedWords.length === 0 ? (
            <p className="text-zinc-400 italic text-center">Tap words below to build your sentence...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => removeWord(index)}
                  className="px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Words */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-zinc-600" style={{ fontWeight: 500 }}>
            Available words:
          </div>
          <Button
            onClick={shuffle}
            size="sm"
            variant="ghost"
            className="text-zinc-500"
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Shuffle
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, index) => (
            <button
              key={index}
              onClick={() => addWord(word, index)}
              className="px-3 py-2 bg-white border-2 border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={checkAnswer}
          disabled={selectedWords.length !== words.length}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Check Sentence
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Result */}
      {isCorrect !== null && (
        <div className={`p-4 text-center ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? (
            <div>
              <div className="text-lg mb-1" style={{ fontWeight: 600 }}>✓ Perfect!</div>
              <div className="text-sm">"{correctSentence}"</div>
            </div>
          ) : (
            <div>
              <div className="text-lg mb-1" style={{ fontWeight: 600 }}>✗ Not quite right</div>
              <div className="text-sm">Try rearranging the words</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
