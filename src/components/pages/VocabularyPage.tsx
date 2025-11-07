import { Card, CardContent } from '../ui/card';

interface VocabularyPageProps {
  page: any;
}

export function VocabularyPage({ page }: VocabularyPageProps) {
  const words = page.content?.words || [];

  return (
    <div className="space-y-4">
      {words.map((word: any, index: number) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dutch</p>
                <p className="text-violet-600">{word.dutch}</p>
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
