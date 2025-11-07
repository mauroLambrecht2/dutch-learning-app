import { Card, CardContent } from '../ui/card';

interface IntroPageProps {
  page: any;
}

export function IntroPage({ page }: IntroPageProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{page.content?.text || 'No content'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
