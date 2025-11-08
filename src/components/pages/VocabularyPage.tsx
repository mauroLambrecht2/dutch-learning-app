import { Card, CardContent } from '../ui/card';
import { Volume2 } from 'lucide-react';

interface VocabularyPageProps {
  page: any;
}

export function VocabularyPage({ page }: VocabularyPageProps) {
  const words = page.content?.words || [];

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error('Failed to play audio:', err));
  };

  return (
    <div className="space-y-4">
      {words.map((word: any, index: number) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dutch</p>
                <div className="flex items-center gap-2">
                  <p className="text-violet-600 font-semibold">{word.dutch}</p>
                  {word.audioUrl && (
                    <button
                      onClick={() => playAudio(word.audioUrl)}
                      className="p-1.5 hover:bg-violet-50 rounded-full transition-colors"
                      title="Play pronunciation"
                    >
                      <Volume2 className="w-4 h-4 text-violet-600" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">English</p>
                <p>{word.english}</p>
              </div>
            </div>
            {word.example && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Example</p>
                <p className="italic text-gray-700">{word.example}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
