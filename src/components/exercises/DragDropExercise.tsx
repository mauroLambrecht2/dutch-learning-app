import { useState } from 'react';
import { Button } from '../ui/button';
import { Check, RotateCcw } from 'lucide-react';

interface DragDropExerciseProps {
  sentence: string; // e.g., "I {go} to the {store}"
  words: string[]; // Words to drag
  onCorrect: () => void;
}

export function DragDropExercise({ sentence, words, onCorrect }: DragDropExerciseProps) {
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [droppedWords, setDroppedWords] = useState<{ [key: number]: string }>({});
  const [availableWords, setAvailableWords] = useState<string[]>(words);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Parse sentence to get blanks
  const parts = sentence.split(/({[^}]+})/g);
  const blanks = parts.filter(p => p.startsWith('{')).map(p => p.slice(1, -1));

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDrop = (index: number) => {
    if (draggedWord) {
      setDroppedWords({ ...droppedWords, [index]: draggedWord });
      setAvailableWords(availableWords.filter(w => w !== draggedWord));
      setDraggedWord(null);
      setIsChecked(false);
    }
  };

  const removeWord = (index: number) => {
    const word = droppedWords[index];
    if (word) {
      setAvailableWords([...availableWords, word]);
      const newDropped = { ...droppedWords };
      delete newDropped[index];
      setDroppedWords(newDropped);
      setIsChecked(false);
    }
  };

  const checkAnswer = () => {
    let correct = true;
    blanks.forEach((blank, index) => {
      if (droppedWords[index] !== blank) {
        correct = false;
      }
    });
    setIsCorrect(correct);
    setIsChecked(true);
    if (correct) {
      setTimeout(onCorrect, 1500);
    }
  };

  const reset = () => {
    setDroppedWords({});
    setAvailableWords(words);
    setIsChecked(false);
    setIsCorrect(null);
  };

  let blankIndex = 0;

  return (
    <div className="space-y-6">
      {/* Sentence with blanks */}
      <div className="p-6 bg-zinc-50 border border-zinc-200">
        <div className="text-lg text-zinc-900 leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('{')) {
              const currentBlankIndex = blankIndex++;
              const droppedWord = droppedWords[currentBlankIndex];
              const expectedWord = blanks[currentBlankIndex];
              
              return (
                <span
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(currentBlankIndex)}
                  className={`inline-block min-w-[120px] mx-1 px-3 py-1 border-2 border-dashed text-center cursor-pointer transition-all ${
                    droppedWord
                      ? isChecked
                        ? droppedWord === expectedWord
                          ? 'bg-green-100 border-green-400'
                          : 'bg-red-100 border-red-400'
                        : 'bg-indigo-100 border-indigo-400'
                      : 'border-zinc-300 bg-white hover:border-indigo-300'
                  }`}
                  onClick={() => droppedWord && removeWord(currentBlankIndex)}
                >
                  {droppedWord || '_____'}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>

      {/* Available words */}
      <div>
        <div className="text-sm text-zinc-600 mb-3" style={{ fontWeight: 500 }}>
          Drag words to fill in the blanks:
        </div>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(word)}
              className="px-4 py-2 bg-white border-2 border-zinc-200 cursor-move hover:border-indigo-400 hover:shadow-sm transition-all select-none"
            >
              {word}
            </div>
          ))}
          {availableWords.length === 0 && !isChecked && (
            <p className="text-sm text-zinc-400 italic">All words used</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={checkAnswer}
          disabled={Object.keys(droppedWords).length !== blanks.length}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Check Answer
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Result */}
      {isCorrect !== null && (
        <div className={`p-4 text-center ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? (
            <div>
              <div className="text-lg mb-1" style={{ fontWeight: 600 }}>✓ Excellent!</div>
              <div className="text-sm">All words are in the correct positions</div>
            </div>
          ) : (
            <div>
              <div className="text-lg mb-1" style={{ fontWeight: 600 }}>✗ Try Again</div>
              <div className="text-sm">Some words are incorrect. Check the highlighted blanks.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
