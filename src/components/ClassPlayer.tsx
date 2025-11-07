import { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, X, RotateCcw } from 'lucide-react';
import { IntroPage } from './pages/IntroPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { MultipleChoicePage } from './pages/MultipleChoicePage';
import { FillInBlankPage } from './pages/FillInBlankPage';
import { MatchingPage } from './pages/MatchingPage';

interface ClassPlayerProps {
  classData: any;
  onComplete: (classId: string, score: number) => void;
  onExit: () => void;
}

export function ClassPlayer({ classData, onComplete, onExit }: ClassPlayerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageAnswers, setPageAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);

  const pages = classData.pages || [];
  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;

  const handleNext = () => {
    if (isLastPage) {
      calculateAndShowResults();
    } else {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handlePageAnswer = (answer: any) => {
    setPageAnswers({
      ...pageAnswers,
      [currentPageIndex]: answer
    });
  };

  const calculateAndShowResults = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let totalQuestions = 0;
    let correctAnswers = 0;

    pages.forEach((page: any, index: number) => {
      const answer = pageAnswers[index];
      
      if (page.type === 'multipleChoice' && page.content?.questions) {
        page.content.questions.forEach((q: any, qIndex: number) => {
          totalQuestions++;
          if (answer?.answers?.[qIndex] === q.correctIndex) {
            correctAnswers++;
          }
        });
      } else if (page.type === 'fillInBlank' && page.content?.exercises) {
        page.content.exercises.forEach((ex: any, exIndex: number) => {
          totalQuestions++;
          if (answer?.answers?.[exIndex]?.toLowerCase().trim() === ex.answer.toLowerCase().trim()) {
            correctAnswers++;
          }
        });
      } else if (page.type === 'matching' && page.content?.pairs) {
        page.content.pairs.forEach((pair: any, pairIndex: number) => {
          totalQuestions++;
          if (answer?.matches?.[pairIndex] === pairIndex) {
            correctAnswers++;
          }
        });
      } else if (page.type === 'flashcards') {
        totalQuestions++;
        if (answer?.viewed) {
          correctAnswers++;
        }
      }
    });

    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
  };

  const handleComplete = () => {
    const score = calculateScore();
    onComplete(classData.id, score);
  };

  const renderPage = () => {
    if (!currentPage) return null;

    const commonProps = {
      page: currentPage,
      answer: pageAnswers[currentPageIndex],
      onAnswer: handlePageAnswer
    };

    switch (currentPage.type) {
      case 'intro':
        return <IntroPage {...commonProps} />;
      case 'vocabulary':
        return <VocabularyPage {...commonProps} />;
      case 'flashcards':
        return <FlashcardsPage {...commonProps} />;
      case 'multipleChoice':
        return <MultipleChoicePage {...commonProps} />;
      case 'fillInBlank':
        return <FillInBlankPage {...commonProps} />;
      case 'matching':
        return <MatchingPage {...commonProps} />;
      default:
        return <div>Unknown page type</div>;
    }
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-zinc-200 p-8">
          <div className="text-center space-y-6">
            {/* Trophy Icon */}
            <div className="w-20 h-20 mx-auto bg-emerald-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
                Lesson Complete!
              </h1>
              <p className="text-sm text-zinc-500">{classData.title}</p>
            </div>

            {/* Score */}
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <div className="text-5xl text-zinc-900 mb-1" style={{ fontWeight: 700 }}>
                {score}%
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide" style={{ fontWeight: 500 }}>
                Final Score
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => {
                  setCurrentPageIndex(0);
                  setPageAnswers({});
                  setShowResults(false);
                }} 
                variant="outline" 
                className="flex-1 border-zinc-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Review
              </Button>
              <Button 
                onClick={handleComplete} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onExit} 
              className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center"
              style={{ fontWeight: 500 }}
            >
              <X className="w-4 h-4 mr-1" />
              Exit
            </button>
            <div className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>
              {currentPageIndex + 1} of {pages.length}
            </div>
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl text-zinc-900 mb-1" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            {currentPage?.title}
          </h2>
        </div>

        {renderPage()}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-zinc-200">
          <Button
            onClick={handlePrevious}
            disabled={currentPageIndex === 0}
            variant="outline"
            className="border-zinc-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLastPage ? 'Finish' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
