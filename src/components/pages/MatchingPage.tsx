import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Check, X, RotateCcw, Volume2 } from "lucide-react";

interface MatchingPageProps {
  page: any;
  answer: any;
  onAnswer: (answer: any) => void;
}

export function MatchingPage({ page, answer, onAnswer }: MatchingPageProps) {
  const pairs = page.content?.pairs || [];
  const [leftSelection, setLeftSelection] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>(
    answer?.matches || {}
  );
  const [isChecked, setIsChecked] = useState(answer?.checked || false);
  const [rightItems, setRightItems] = useState<any[]>([]);

  useEffect(() => {
    // Reset and shuffle when page changes
    if (pairs.length > 0) {
      const shuffled = [...pairs]
        .map((p: any) => p?.right)
        .filter(Boolean)
        .sort(() => Math.random() - 0.5);
      setRightItems(shuffled);
      setMatches({});
      setLeftSelection(null);
      setIsChecked(false);
      onAnswer({ matches: {}, checked: false, rightItems: shuffled });
    }
  }, [page]);

  const handleLeftClick = (index: number) => {
    if (isChecked) return;
    setLeftSelection(index);
  };

  const handleRightClick = (rightIndex: number) => {
    if (isChecked || leftSelection === null) return;

    const newMatches = {
      ...matches,
      [leftSelection]: rightIndex,
    };
    setMatches(newMatches);
    setLeftSelection(null);
    onAnswer({ matches: newMatches, checked: false, rightItems });
  };

  const handleCheck = () => {
    setIsChecked(true);
    onAnswer({ matches, checked: true, rightItems });
  };

  const handleReset = () => {
    setMatches({});
    setLeftSelection(null);
    setIsChecked(false);
    const shuffled = [...pairs]
      .map((p: any) => p.right)
      .sort(() => Math.random() - 0.5);
    setRightItems(shuffled);
    onAnswer({ matches: {}, checked: false, rightItems: shuffled });
  };

  const isCorrectMatch = (leftIndex: number, rightIndex: number) => {
    if (!pairs[leftIndex] || !rightItems[rightIndex]) return false;
    return rightItems[rightIndex] === pairs[leftIndex].right;
  };

  const getMatchedLeft = (rightIndex: number) => {
    return Object.entries(matches).find(([_, r]) => r === rightIndex)?.[0];
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => console.error("Failed to play audio:", err));
  };

  if (pairs.length === 0) {
    return <div>No matching pairs available</div>;
  }

  // Don't render until rightItems are initialized
  if (rightItems.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Match the items by clicking on the left, then the right:
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-2">
              {pairs.map((pair: any, index: number) => {
                const matchedRight = matches[index];
                const isSelected = leftSelection === index;
                const showResult = isChecked && matchedRight !== undefined;
                const correct =
                  showResult && isCorrectMatch(index, matchedRight);

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start h-auto py-3 ${
                      isSelected ? "border-violet-500 bg-violet-50" : ""
                    } ${
                      showResult
                        ? correct
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : ""
                    }`}
                    onClick={() => handleLeftClick(index)}
                    disabled={isChecked}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="flex-1 text-left">{pair.left}</span>
                      {pair.audioUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(pair.audioUrl);
                          }}
                          className="p-1 hover:bg-violet-100 rounded-full transition-colors"
                          title="Play pronunciation"
                        >
                          <Volume2 className="w-3 h-3 text-violet-600" />
                        </button>
                      )}
                      {showResult &&
                        (correct ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        ))}
                      {!isChecked && matchedRight !== undefined && (
                        <span className="text-xs text-gray-500">→</span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              {rightItems.map((item: string, index: number) => {
                const matchedLeftIndex = getMatchedLeft(index);
                const isMatched = matchedLeftIndex !== undefined;
                const showResult = isChecked && isMatched;
                const correct =
                  showResult && isCorrectMatch(Number(matchedLeftIndex), index);

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start h-auto py-3 ${
                      isMatched && !isChecked
                        ? "border-violet-500 bg-violet-50"
                        : ""
                    } ${
                      showResult
                        ? correct
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : ""
                    }`}
                    onClick={() => handleRightClick(index)}
                    disabled={isChecked || isMatched}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {!isChecked && isMatched && (
                        <span className="text-xs text-gray-500">←</span>
                      )}
                      <span className="flex-1 text-left">{item}</span>
                      {showResult &&
                        (correct ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        ))}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {!isChecked && Object.keys(matches).length === pairs.length && (
              <Button onClick={handleCheck} className="flex-1">
                Check Answers
              </Button>
            )}
            {isChecked && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          {isChecked && (
            <div className="mt-4">
              {Object.entries(matches).every(([left, right]) =>
                isCorrectMatch(Number(left), right as number)
              ) ? (
                <div className="p-3 rounded-lg bg-green-100 text-green-800">
                  <Check className="w-5 h-5 inline mr-2" />
                  Perfect! All matches are correct!
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-violet-100 text-violet-800">
                  Some matches are incorrect. Review and try again!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
