import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Timer, Trophy } from 'lucide-react';

interface SpeedRoundProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
  timeLimit?: number; // seconds
  onComplete: (score: number, time: number) => void;
}

export function SpeedRound({ questions, timeLimit = 60, onComplete }: SpeedRoundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isStarted && !isFinished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            finishGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, isFinished, timeLeft]);

  const startGame = () => {
    setIsStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timeLimit);
    setIsFinished(false);
    setUserAnswer('');
  };

  const finishGame = () => {
    setIsFinished(true);
    onComplete(score, timeLimit - timeLeft);
  };

  const submitAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === questions[currentIndex].answer.toLowerCase().trim();
    if (correct) {
      setScore(score + 1);
    }

    if (currentIndex + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
    }
  };

  if (!isStarted) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Timer className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
            Speed Round Challenge
          </h3>
          <p className="text-zinc-600">
            Answer {questions.length} questions in {timeLimit} seconds!
          </p>
        </div>
        <Button
          onClick={startGame}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Start Challenge
        </Button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-12">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-3xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
          Challenge Complete!
        </h3>
        <div className="text-6xl text-indigo-600 my-6" style={{ fontWeight: 700 }}>
          {score}/{questions.length}
        </div>
        <p className="text-xl text-zinc-600 mb-2">
          {percentage}% Correct
        </p>
        <p className="text-zinc-500 mb-6">
          Completed in {timeLimit - timeLeft} seconds
        </p>
        <Button
          onClick={startGame}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-indigo-600" style={{ fontWeight: 600 }}>
              QUESTION
            </div>
            <div className="text-2xl text-indigo-900" style={{ fontWeight: 700 }}>
              {currentIndex + 1}/{questions.length}
            </div>
          </div>
          <div className="w-px h-10 bg-indigo-200"></div>
          <div>
            <div className="text-xs text-indigo-600" style={{ fontWeight: 600 }}>
              SCORE
            </div>
            <div className="text-2xl text-indigo-900" style={{ fontWeight: 700 }}>
              {score}
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs text-indigo-600 mb-1" style={{ fontWeight: 600 }}>
            TIME LEFT
          </div>
          <div className={`text-3xl ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-indigo-900'}`} style={{ fontWeight: 700 }}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-8 bg-zinc-50 border border-zinc-200 text-center">
        <h3 className="text-2xl text-zinc-900" style={{ fontWeight: 600 }}>
          {questions[currentIndex].question}
        </h3>
      </div>

      {/* Answer */}
      <div className="space-y-3">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && userAnswer && submitAnswer()}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 border-2 border-zinc-200 text-lg focus:border-indigo-500 focus:outline-none"
          autoFocus
        />
        <Button
          onClick={submitAnswer}
          disabled={!userAnswer}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          size="lg"
        >
          Submit Answer
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-200">
        <div
          className="h-full bg-indigo-600 transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
