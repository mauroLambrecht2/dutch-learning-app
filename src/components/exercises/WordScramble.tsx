import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Shuffle, Check } from 'lucide-react';

interface WordScrambleProps {
  word: string;
  hint?: string;
  onCorrect: () => void;
}

export function WordScramble({ word, hint, onCorrect }: WordScrambleProps) {
  const [scrambled, setScrambled] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    scrambleWord();
  }, [word]);

  const scrambleWord = () => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setScrambled(letters.join(''));
    setUserAnswer('');
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase() === word.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setTimeout(onCorrect, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-block p-4 bg-indigo-50 border border-indigo-200 mb-4">
          <div className="text-2xl tracking-widest text-indigo-900" style={{ fontWeight: 700 }}>
            {scrambled}
          </div>
        </div>
        {hint && (
          <p className="text-sm text-zinc-600">
            <span className="text-zinc-500">Hint:</span> {hint}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Type the unscrambled word..."
          className="flex-1 px-4 py-2 border border-zinc-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <Button onClick={checkAnswer} className="bg-indigo-600 hover:bg-indigo-700">
          <Check className="w-4 h-4 mr-2" />
          Check
        </Button>
        <Button onClick={scrambleWord} variant="outline">
          <Shuffle className="w-4 h-4" />
        </Button>
      </div>

      {isCorrect !== null && (
        <div className={`p-3 text-center text-sm ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? '✓ Correct!' : `✗ Try again. The correct answer is: ${word}`}
        </div>
      )}
    </div>
  );
}
