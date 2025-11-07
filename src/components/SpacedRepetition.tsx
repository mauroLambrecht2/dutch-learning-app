import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Brain, Check, X, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  nextReview: string;
  interval: number; // days
  easeFactor: number;
  reviewCount: number;
}

interface SpacedRepetitionProps {
  accessToken: string;
}

export function SpacedRepetition({ accessToken }: SpacedRepetitionProps) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [dueCards, setDueCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ easy: 0, good: 0, hard: 0, again: 0 });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await api.getSpacedRepetitionCards(accessToken);
      const allCards = data.cards || [];
      
      // Filter cards that are due for review
      const now = new Date();
      const due = allCards.filter((card: FlashCard) => 
        new Date(card.nextReview) <= now
      );
      
      setCards(allCards);
      setDueCards(due);
    } catch (error) {
      console.error('Failed to load cards:', error);
    }
  };

  const calculateNextReview = (currentInterval: number, easeFactor: number, quality: number) => {
    // SM-2 Algorithm
    let newInterval = currentInterval;
    let newEaseFactor = easeFactor;

    if (quality >= 3) {
      if (currentInterval === 0) {
        newInterval = 1;
      } else if (currentInterval === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * easeFactor);
      }
    } else {
      newInterval = 1;
    }

    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    return { newInterval, newEaseFactor };
  };

  const handleResponse = async (quality: 'again' | 'hard' | 'good' | 'easy') => {
    const card = dueCards[currentCardIndex];
    const qualityMap = { again: 0, hard: 2, good: 3, easy: 5 };
    const qualityValue = qualityMap[quality];

    const { newInterval, newEaseFactor } = calculateNextReview(
      card.interval,
      card.easeFactor,
      qualityValue
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    // Update stats
    setStats({ ...stats, [quality]: stats[quality] + 1 });

    try {
      await api.updateSpacedRepetitionCard(accessToken, card.id, {
        interval: newInterval,
        easeFactor: newEaseFactor,
        nextReview: nextReview.toISOString(),
        reviewCount: card.reviewCount + 1,
      });

      // Move to next card
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  };

  const restart = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionComplete(false);
    setStats({ easy: 0, good: 0, hard: 0, again: 0 });
    loadCards();
  };

  if (sessionComplete || dueCards.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 p-12 text-center">
        <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        {dueCards.length === 0 ? (
          <>
            <h3 className="text-2xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
              No cards due!
            </h3>
            <p className="text-zinc-600 mb-6">
              Come back later for your next review session.
            </p>
            <div className="text-sm text-zinc-500">
              Total cards: {cards.length}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
              Session Complete!
            </h3>
            <p className="text-zinc-600 mb-6">
              You reviewed {dueCards.length} cards
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-6">
              <div className="p-3 bg-red-50 border border-red-200">
                <div className="text-2xl text-red-600" style={{ fontWeight: 700 }}>
                  {stats.again}
                </div>
                <div className="text-xs text-red-700">Again</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200">
                <div className="text-2xl text-yellow-600" style={{ fontWeight: 700 }}>
                  {stats.hard}
                </div>
                <div className="text-xs text-yellow-700">Hard</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200">
                <div className="text-2xl text-green-600" style={{ fontWeight: 700 }}>
                  {stats.good}
                </div>
                <div className="text-xs text-green-700">Good</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200">
                <div className="text-2xl text-blue-600" style={{ fontWeight: 700 }}>
                  {stats.easy}
                </div>
                <div className="text-xs text-blue-700">Easy</div>
              </div>
            </div>

            <Button onClick={restart} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start New Session
            </Button>
          </>
        )}
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];

  return (
    <div className="bg-white border border-zinc-200">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
              Spaced Repetition
            </h2>
            <p className="text-sm text-zinc-500">
              Card {currentCardIndex + 1} of {dueCards.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500">Progress</div>
            <div className="text-2xl text-indigo-600" style={{ fontWeight: 700 }}>
              {Math.round(((currentCardIndex + 1) / dueCards.length) * 100)}%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-zinc-200">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((currentCardIndex + 1) / dueCards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card */}
      <div className="p-12">
        <div className="max-w-2xl mx-auto">
          {/* Front of card */}
          <div className="mb-8 text-center">
            <div className="text-sm text-zinc-500 mb-4">Question</div>
            <div className="text-4xl text-zinc-900 mb-4" style={{ fontWeight: 700 }}>
              {currentCard.front}
            </div>
          </div>

          {/* Show Answer Button or Answer */}
          {!showAnswer ? (
            <div className="text-center">
              <Button
                onClick={() => setShowAnswer(true)}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Show Answer
              </Button>
            </div>
          ) : (
            <>
              {/* Back of card */}
              <div className="mb-8 text-center p-6 bg-indigo-50 border-2 border-indigo-200">
                <div className="text-sm text-indigo-600 mb-2" style={{ fontWeight: 600 }}>
                  Answer
                </div>
                <div className="text-2xl text-indigo-900" style={{ fontWeight: 600 }}>
                  {currentCard.back}
                </div>
              </div>

              {/* Quality Buttons */}
              <div>
                <div className="text-sm text-zinc-600 text-center mb-4" style={{ fontWeight: 500 }}>
                  How well did you know this?
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => handleResponse('again')}
                    variant="outline"
                    className="border-2 border-red-300 hover:bg-red-50 hover:border-red-400 py-6 flex-col h-auto"
                  >
                    <X className="w-5 h-5 text-red-600 mb-2" />
                    <div className="text-sm text-red-700" style={{ fontWeight: 600 }}>
                      Again
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      &lt; 1 day
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleResponse('hard')}
                    variant="outline"
                    className="border-2 border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 py-6 flex-col h-auto"
                  >
                    <div className="text-sm text-yellow-700" style={{ fontWeight: 600 }}>
                      Hard
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {Math.max(1, Math.floor(currentCard.interval * 0.5))} days
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleResponse('good')}
                    variant="outline"
                    className="border-2 border-green-300 hover:bg-green-50 hover:border-green-400 py-6 flex-col h-auto"
                  >
                    <Check className="w-5 h-5 text-green-600 mb-2" />
                    <div className="text-sm text-green-700" style={{ fontWeight: 600 }}>
                      Good
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {Math.max(1, currentCard.interval || 1)} days
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleResponse('easy')}
                    variant="outline"
                    className="border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 py-6 flex-col h-auto"
                  >
                    <div className="text-sm text-blue-700" style={{ fontWeight: 600 }}>
                      Easy
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {Math.max(4, Math.floor(currentCard.interval * 1.5))} days
                    </div>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200">
        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
          <span>Review #{currentCard.reviewCount + 1}</span>
          <span>•</span>
          <span>Current interval: {currentCard.interval} days</span>
          <span>•</span>
          <span>Ease: {(currentCard.easeFactor * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}