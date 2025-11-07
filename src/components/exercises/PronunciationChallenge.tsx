import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Mic, Square, Play, RotateCcw, Volume2 } from 'lucide-react';

interface PronunciationChallengeProps {
  word: string;
  referenceAudioUrl: string;
  onComplete: (score: number) => void;
}

export function PronunciationChallenge({ word, referenceAudioUrl, onComplete }: PronunciationChallengeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const playReference = () => {
    new Audio(referenceAudioUrl).play();
  };

  const playUserRecording = () => {
    if (userAudioUrl) {
      new Audio(userAudioUrl).play();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setUserAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        
        // Simulate pronunciation scoring (in real app, would use speech recognition API)
        const simulatedScore = Math.floor(Math.random() * 30) + 70; // 70-100
        setScore(simulatedScore);
        setAttempts(attempts + 1);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const tryAgain = () => {
    setUserAudioUrl(null);
    setScore(null);
  };

  const handleComplete = () => {
    if (score) {
      onComplete(score);
    }
  };

  return (
    <div className="space-y-6">
      {/* Word to Pronounce */}
      <div className="text-center">
        <div className="text-sm text-zinc-500 mb-2">Pronounce this word:</div>
        <div className="text-5xl text-indigo-900 mb-4" style={{ fontWeight: 700 }}>
          {word}
        </div>
        <Button
          onClick={playReference}
          variant="outline"
          size="lg"
          className="border-zinc-200"
        >
          <Volume2 className="w-5 h-5 mr-2" />
          Hear Pronunciation
        </Button>
      </div>

      {/* Recording Interface */}
      <div className="p-6 bg-zinc-50 border border-zinc-200">
        <div className="text-center space-y-4">
          {!userAudioUrl ? (
            <>
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  Recording your pronunciation...
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Button onClick={playUserRecording} variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Play My Recording
                </Button>
                <Button onClick={tryAgain} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>

              {score !== null && (
                <div className="mt-6">
                  <div className={`text-6xl mb-2 ${
                    score >= 90 ? 'text-green-600' :
                    score >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`} style={{ fontWeight: 700 }}>
                    {score}%
                  </div>
                  <div className="text-sm text-zinc-600 mb-4">
                    {score >= 90 ? '🎉 Excellent pronunciation!' :
                     score >= 70 ? '👍 Good job! Keep practicing.' :
                     '💪 Keep trying! Listen carefully and try again.'}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-zinc-200 mb-4">
                    <div
                      className={`h-full transition-all ${
                        score >= 90 ? 'bg-green-500' :
                        score >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2">
                    {score >= 70 ? (
                      <Button
                        onClick={handleComplete}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Continue →
                      </Button>
                    ) : null}
                    <Button onClick={tryAgain} variant="outline" className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Record Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {attempts > 0 && (
            <div className="text-xs text-zinc-400">
              Attempt {attempts}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200">
        <div className="text-xs text-blue-700 mb-2" style={{ fontWeight: 600 }}>
          💡 TIPS
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Listen to the reference pronunciation first</li>
          <li>• Speak clearly into your microphone</li>
          <li>• Try to match the accent and intonation</li>
          <li>• Don't worry about perfection - practice makes progress!</li>
        </ul>
      </div>
    </div>
  );
}
