import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Check, X, Volume2 } from 'lucide-react';

interface MultipleChoicePageProps {
  page: any;
  answer: any;
  onAnswer: (answer: any) => void;
}

export function MultipleChoicePage({ page, answer, onAnswer }: MultipleChoicePageProps) {
  const questions = page.content?.questions || [];
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(answer?.answers || {});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>(answer?.showFeedback || {});

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    const newSelectedAnswers = {
      ...selectedAnswers,
      [questionIndex]: optionIndex
    };
    setSelectedAnswers(newSelectedAnswers);
    onAnswer({ answers: newSelectedAnswers, showFeedback });
  };

  const handleCheckAnswer = (questionIndex: number) => {
    const newShowFeedback = {
      ...showFeedback,
      [questionIndex]: true
    };
    setShowFeedback(newShowFeedback);
    onAnswer({ answers: selectedAnswers, showFeedback: newShowFeedback });
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error('Failed to play audio:', err));
  };

  return (
    <div className="space-y-6">
      {questions.map((question: any, qIndex: number) => {
        const selectedOption = selectedAnswers[qIndex];
        const isAnswered = showFeedback[qIndex];
        const isCorrect = selectedOption === question.correctIndex;

        return (
          <Card key={qIndex}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <p className="flex-1">{question.question}</p>
                {question.audioUrl && (
                  <button
                    onClick={() => playAudio(question.audioUrl)}
                    className="p-2 hover:bg-violet-50 rounded-full transition-colors flex-shrink-0"
                    title="Play pronunciation"
                  >
                    <Volume2 className="w-5 h-5 text-violet-600" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {question.options.map((option: string, optIndex: number) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrectOption = optIndex === question.correctIndex;
                  
                  let buttonClass = 'w-full justify-start text-left h-auto py-3';
                  if (isAnswered) {
                    if (isCorrectOption) {
                      buttonClass += ' border-green-500 bg-green-50';
                    } else if (isSelected && !isCorrect) {
                      buttonClass += ' border-red-500 bg-red-50';
                    }
                  } else if (isSelected) {
                    buttonClass += ' border-violet-500 bg-violet-50';
                  }

                  return (
                    <Button
                      key={optIndex}
                      variant="outline"
                      className={buttonClass}
                      onClick={() => !isAnswered && handleSelectOption(qIndex, optIndex)}
                      disabled={isAnswered}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1">{option}</span>
                        {isAnswered && isCorrectOption && (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
              {!isAnswered && selectedOption !== undefined && (
                <Button
                  onClick={() => handleCheckAnswer(qIndex)}
                  className="mt-4"
                >
                  Check Answer
                </Button>
              )}
              {isAnswered && (
                <div className={`mt-4 p-3 rounded-lg ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect. Try reviewing the material.'}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
