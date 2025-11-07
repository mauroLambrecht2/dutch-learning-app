import { useState } from 'react';
import { Button } from '../ui/button';
import { Volume2, Check } from 'lucide-react';

interface ListeningExerciseProps {
  audioUrl: string;
  correctAnswer: string;
  options?: string[];
  onCorrect: () => void;
}

export function ListeningExercise({ audioUrl, correctAnswer, options, onCorrect }: ListeningExerciseProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [playCount, setPlayCount] = useState(0);

  const playAudio = () => {
    const audio = new Audio(audioUrl);
    audio.play();
    setPlayCount(playCount + 1);
  };

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setTimeout(onCorrect, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Button
          onClick={playAudio}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Volume2 className="w-5 h-5 mr-2" />
          Play Audio {playCount > 0 && `(${playCount})`}
        </Button>
        <p className="text-sm text-zinc-500 mt-2">
          Listen carefully and type what you hear
        </p>
      </div>

      {options ? (
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setUserAnswer(option)}
              className={`w-full p-4 text-left border-2 transition-all ${
                userAnswer === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  userAnswer === option
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-zinc-300'
                }`}>
                  {userAnswer === option && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-zinc-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="Type what you hear..."
            className="w-full px-4 py-3 border-2 border-zinc-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      )}

      <Button
        onClick={checkAnswer}
        disabled={!userAnswer}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        <Check className="w-4 h-4 mr-2" />
        Check Answer
      </Button>

      {isCorrect !== null && (
        <div className={`p-4 text-center ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? (
            <div>
              <div className="text-lg mb-1" style={{ fontWeight: 600 }}>✓ Perfect!</div>
              <div className="text-sm">You heard it correctly: "{correctAnswer}"</div>
            </div>
          ) : (
            <div>
              <div className="text-lg mb-1" style={{ fontWeight: 600 }}>✗ Not quite</div>
              <div className="text-sm">The correct answer is: "{correctAnswer}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
