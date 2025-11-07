import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FlashcardsPageProps {
  page: any;
  answer: any;
  onAnswer: (answer: any) => void;
}

export function FlashcardsPage({ page, answer, onAnswer }: FlashcardsPageProps) {
  const cards = page.content?.cards || [];
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!answer?.viewed) {
      onAnswer({ viewed: true });
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  if (cards.length === 0) {
    return <div>No flashcards available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600">
          Card {currentCardIndex + 1} of {cards.length}
        </span>
        <Button
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          variant="outline"
          size="sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="perspective-1000">
        <motion.div
          className="relative w-full h-80 cursor-pointer"
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <Card
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <p className="text-sm text-gray-600 mb-4">Dutch</p>
              <p className="text-3xl text-violet-600 text-center">{currentCard.front}</p>
              <p className="text-sm text-gray-400 mt-8">Click to flip</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="absolute inset-0 backface-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8">
              <p className="text-sm text-gray-600 mb-4">English</p>
              <p className="text-3xl text-center">{currentCard.back}</p>
              <p className="text-sm text-gray-400 mt-8">Click to flip back</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={() => setIsFlipped(false)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Card
        </Button>
      </div>
    </div>
  );
}
