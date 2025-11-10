import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Check, X, Volume2 } from 'lucide-react';

interface FillInBlankPageProps {
  page: any;
  answer: any;
  onAnswer: (answer: any) => void;
}

export function FillInBlankPage({ page, answer, onAnswer }: FillInBlankPageProps) {
  const exercises = page.content?.exercises || [];
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>(answer?.answers || {});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>(answer?.checked || {});

  useEffect(() => {
    // Reset state when page changes
    setUserAnswers({});
    setCheckedAnswers({});
    onAnswer({ answers: {}, checked: {} });
  }, [page]);

  const handleAnswerChange = (exerciseIndex: number, value: string) => {
    const newAnswers = {
      ...userAnswers,
      [exerciseIndex]: value
    };
    setUserAnswers(newAnswers);
    onAnswer({ answers: newAnswers, checked: checkedAnswers });
  };

  const handleCheckAnswer = (exerciseIndex: number) => {
    const newChecked = {
      ...checkedAnswers,
      [exerciseIndex]: true
    };
    setCheckedAnswers(newChecked);
    onAnswer({ answers: userAnswers, checked: newChecked });
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error('Failed to play audio:', err));
  };

  const renderSentenceWithBlank = (sentence: string, answer: string, userAnswer: string, isChecked: boolean) => {
    const parts = sentence.split('___');
    
    return (
      <div className="flex flex-wrap items-center gap-2">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-block mx-2">
                {isChecked ? (
                  <span className={`px-3 py-1 rounded ${
                    userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userAnswer}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 rounded">
                    {userAnswer || '___'}
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {exercises.map((exercise: any, exIndex: number) => {
        const userAnswer = userAnswers[exIndex] || '';
        const isChecked = checkedAnswers[exIndex];
        const isCorrect = userAnswer.toLowerCase().trim() === exercise.answer.toLowerCase().trim();

        return (
          <Card key={exIndex}>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Fill in the blank:</p>
                  {exercise.audioUrl && (
                    <button
                      onClick={() => playAudio(exercise.audioUrl)}
                      className="p-1.5 hover:bg-violet-50 rounded-full transition-colors"
                      title="Play pronunciation"
                    >
                      <Volume2 className="w-4 h-4 text-violet-600" />
                    </button>
                  )}
                </div>
                <p className="text-lg">{renderSentenceWithBlank(exercise.sentence, exercise.answer, userAnswer, isChecked)}</p>
              </div>
              
              {!isChecked && (
                <div className="flex gap-2">
                  <Input
                    value={userAnswer}
                    onChange={(e) => handleAnswerChange(exIndex, e.target.value)}
                    placeholder="Type your answer..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleCheckAnswer(exIndex)}
                    disabled={!userAnswer.trim()}
                  >
                    Check
                  </Button>
                </div>
              )}

              {isChecked && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      <span>Incorrect. The correct answer is: <strong>{exercise.answer}</strong></span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
