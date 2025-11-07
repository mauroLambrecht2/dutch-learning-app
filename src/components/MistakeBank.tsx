import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { AlertCircle, RotateCcw, Trash2, BookOpen, Filter } from 'lucide-react';
import { Button } from './ui/button';

interface Mistake {
  id: string;
  word: string;
  userAnswer: string;
  correctAnswer: string;
  category: string;
  lessonTitle: string;
  timestamp: string;
  reviewedCount: number;
  mastered: boolean;
}

interface MistakeBankProps {
  accessToken: string;
}

export function MistakeBank({ accessToken }: MistakeBankProps) {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'mastered'>('active');
  const [sortBy, setSortBy] = useState<'recent' | 'frequent'>('recent');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentMistakeIndex, setCurrentMistakeIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const data = await api.getMistakes(accessToken);
      setMistakes(data || []);
    } catch (error) {
      console.error('Failed to load mistakes:', error);
    }
  };

  const filteredMistakes = mistakes.filter(m => {
    if (filter === 'active') return !m.mastered;
    if (filter === 'mastered') return m.mastered;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return b.reviewedCount - a.reviewedCount;
    }
  });

  const markAsMastered = async (mistakeId: string) => {
    try {
      await api.updateMistake(accessToken, mistakeId, { mastered: true });
      loadMistakes();
    } catch (error) {
      console.error('Failed to mark as mastered:', error);
    }
  };

  const deleteMistake = async (mistakeId: string) => {
    if (!confirm('Remove this mistake from your bank?')) return;
    
    try {
      await api.deleteMistake(accessToken, mistakeId);
      loadMistakes();
    } catch (error) {
      console.error('Failed to delete mistake:', error);
    }
  };

  const checkPracticeAnswer = () => {
    const mistake = filteredMistakes[currentMistakeIndex];
    setShowAnswer(true);
    
    if (userAnswer.toLowerCase().trim() === mistake.correctAnswer.toLowerCase().trim()) {
      setTimeout(() => {
        if (currentMistakeIndex < filteredMistakes.length - 1) {
          setCurrentMistakeIndex(currentMistakeIndex + 1);
          setUserAnswer('');
          setShowAnswer(false);
        } else {
          setPracticeMode(false);
          alert('Practice complete! Great job reviewing your mistakes.');
        }
      }, 2000);
    }
  };

  if (practiceMode && filteredMistakes.length > 0) {
    const mistake = filteredMistakes[currentMistakeIndex];
    
    return (
      <div className="bg-white border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
                Practice Mode
              </h2>
              <p className="text-sm text-zinc-500">
                Question {currentMistakeIndex + 1} of {filteredMistakes.length}
              </p>
            </div>
            <Button
              onClick={() => {
                setPracticeMode(false);
                setCurrentMistakeIndex(0);
                setUserAnswer('');
                setShowAnswer(false);
              }}
              variant="outline"
              size="sm"
            >
              Exit Practice
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Progress */}
          <div className="h-2 bg-zinc-200">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${((currentMistakeIndex + 1) / filteredMistakes.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="text-center">
            <div className="text-sm text-zinc-500 mb-2">Translate:</div>
            <div className="text-3xl text-zinc-900 mb-2" style={{ fontWeight: 700 }}>
              {mistake.word}
            </div>
            <div className="text-xs text-zinc-400">
              From: {mistake.lessonTitle}
            </div>
          </div>

          {/* Answer Input */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !showAnswer && checkPracticeAnswer()}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border-2 border-zinc-200 text-lg focus:border-indigo-500 focus:outline-none"
              disabled={showAnswer}
            />
          </div>

          {!showAnswer ? (
            <div className="text-center">
              <Button
                onClick={checkPracticeAnswer}
                disabled={!userAnswer.trim()}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Check Answer
              </Button>
            </div>
          ) : (
            <div className={`p-6 text-center ${
              userAnswer.toLowerCase().trim() === mistake.correctAnswer.toLowerCase().trim()
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              {userAnswer.toLowerCase().trim() === mistake.correctAnswer.toLowerCase().trim() ? (
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <div className="text-lg text-green-700 mb-1" style={{ fontWeight: 600 }}>
                    Correct!
                  </div>
                  <div className="text-sm text-green-600">
                    Moving to next question...
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">✗</div>
                  <div className="text-lg text-red-700 mb-1" style={{ fontWeight: 600 }}>
                    Not quite
                  </div>
                  <div className="text-sm text-red-600 mb-3">
                    Your answer: <span style={{ fontWeight: 600 }}>{userAnswer}</span>
                  </div>
                  <div className="text-sm text-zinc-700">
                    Correct answer: <span className="text-green-600" style={{ fontWeight: 600 }}>{mistake.correctAnswer}</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (currentMistakeIndex < filteredMistakes.length - 1) {
                        setCurrentMistakeIndex(currentMistakeIndex + 1);
                        setUserAnswer('');
                        setShowAnswer(false);
                      } else {
                        setPracticeMode(false);
                      }
                    }}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
                Mistake Bank
              </h2>
            </div>
            <p className="text-sm text-zinc-500">
              Review and practice words you've gotten wrong
            </p>
          </div>
          {filteredMistakes.length > 0 && (
            <Button
              onClick={() => {
                setPracticeMode(true);
                setCurrentMistakeIndex(0);
                setUserAnswer('');
                setShowAnswer(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice All ({filteredMistakes.length})
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-zinc-200 px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Mistakes</option>
              <option value="active">Active (Not Mastered)</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-zinc-200 px-3 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="frequent">Most Reviewed</option>
          </select>
        </div>
      </div>

      {/* Mistakes List */}
      <div>
        {filteredMistakes.length === 0 ? (
          <div className="p-12 text-center">
            {filter === 'mastered' ? (
              <>
                <Trophy className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-400 mb-2">No mastered mistakes yet</p>
                <p className="text-sm text-zinc-500">Keep practicing to master your mistakes!</p>
              </>
            ) : (
              <>
                <BookOpen className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-600 mb-2" style={{ fontWeight: 600 }}>
                  No mistakes found!
                </p>
                <p className="text-sm text-zinc-500">You're doing great! Keep learning.</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {filteredMistakes.map((mistake) => (
              <div key={mistake.id} className="p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                        {mistake.word}
                      </div>
                      {mistake.mastered && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs">
                          MASTERED
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs">
                        {mistake.category}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="text-sm text-red-600">
                        <span className="text-zinc-500">Your answer:</span> {mistake.userAnswer}
                      </div>
                      <div className="text-sm text-green-600">
                        <span className="text-zinc-500">Correct answer:</span> {mistake.correctAnswer}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>From: {mistake.lessonTitle}</span>
                      <span>•</span>
                      <span>Reviewed {mistake.reviewedCount} times</span>
                      <span>•</span>
                      <span>{new Date(mistake.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!mistake.mastered && (
                      <Button
                        onClick={() => markAsMastered(mistake.id)}
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        ✓ Mastered
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteMistake(mistake.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
