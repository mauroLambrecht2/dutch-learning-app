import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { X, Upload, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface JSONImporterProps {
  onImport: (data: any) => void;
  onClose: () => void;
}

export function JSONImporter({ onImport, onClose }: JSONImporterProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleImport = () => {
    setError('');
    try {
      const data = JSON.parse(jsonText);
      
      // Validate basic structure
      if (!data.title) {
        setError('Missing required field: title');
        return;
      }
      if (!data.pages || !Array.isArray(data.pages)) {
        setError('Missing or invalid pages array');
        return;
      }
      
      // Validate each page has required fields
      for (let i = 0; i < data.pages.length; i++) {
        const page = data.pages[i];
        if (!page.type) {
          setError(`Page ${i + 1} is missing required field: type`);
          return;
        }
        if (!page.content) {
          setError(`Page ${i + 1} is missing required field: content`);
          return;
        }
      }
      
      onImport(data);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Check the syntax and try again.');
      } else {
        setError(err.message || 'An error occurred while parsing JSON');
      }
    }
  };

  const copyExample = (example: any) => {
    const jsonString = JSON.stringify(example, null, 2);
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonString)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback to textarea method
          fallbackCopy(jsonString);
        });
    } else {
      // Fallback for older browsers or restricted contexts
      fallbackCopy(jsonString);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textarea);
  };

  const exampleBasic = {
    title: "Basic Greetings",
    description: "Learn common Dutch greetings",
    dayId: "", // Optional - leave empty for no chapter
    pages: [
      {
        id: "page-1",
        type: "intro",
        title: "Introduction",
        content: {
          text: "Welcome! In this lesson, you'll learn essential Dutch greetings."
        }
      },
      {
        id: "page-2",
        type: "vocabulary",
        title: "Common Greetings",
        content: {
          words: [
            { 
              dutch: "Hallo", 
              english: "Hello", 
              example: "Hallo, hoe gaat het?" 
            },
            { 
              dutch: "Goedemorgen", 
              english: "Good morning", 
              example: "Goedemorgen allemaal!" 
            }
          ]
        }
      },
      {
        id: "page-3",
        type: "multipleChoice",
        title: "Quiz Time",
        content: {
          questions: [
            {
              question: "How do you say 'Hello' in Dutch?",
              options: ["Hallo", "Bonjour", "Hola", "Ciao"],
              correctIndex: 0
            }
          ]
        }
      }
    ]
  };

  const exampleAdvanced = {
    title: "Complete Lesson Example",
    description: "All exercise types in one lesson",
    pages: [
      {
        id: "intro",
        type: "intro",
        title: "Welcome",
        content: { text: "Introduction text here..." }
      },
      {
        id: "vocab",
        type: "vocabulary",
        title: "New Words",
        content: {
          words: [
            { dutch: "kat", english: "cat", example: "De kat is zwart." }
          ]
        }
      },
      {
        id: "flash",
        type: "flashcards",
        title: "Practice Cards",
        content: {
          cards: [
            { front: "hond", back: "dog" }
          ]
        }
      },
      {
        id: "mc",
        type: "multipleChoice",
        title: "Quiz",
        content: {
          questions: [
            {
              question: "What is 'cat' in Dutch?",
              options: ["hond", "kat", "vis", "vogel"],
              correctIndex: 1
            }
          ]
        }
      },
      {
        id: "fib",
        type: "fillInBlank",
        title: "Fill the Blanks",
        content: {
          exercises: [
            { 
              sentence: "Ik heb een ___ .", 
              answer: "kat" 
            }
          ]
        }
      },
      {
        id: "match",
        type: "matching",
        title: "Match Words",
        content: {
          pairs: [
            { left: "kat", right: "cat" },
            { left: "hond", right: "dog" }
          ]
        }
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="max-w-5xl w-full max-h-[90vh] overflow-auto bg-white border border-zinc-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
                Import Lesson from JSON
              </h2>
              <p className="text-sm text-zinc-500">
                Quickly create lessons by pasting JSON data
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="import">Import JSON</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="reference">Reference</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-zinc-700" style={{ fontWeight: 500 }}>
                  Paste your JSON here
                </label>
                <Textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setError('');
                  }}
                  placeholder='{"title": "My Lesson", "description": "...", "pages": [...]}'
                  rows={16}
                  className="font-mono text-sm"
                />
                {error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleImport} 
                  disabled={!jsonText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Lesson
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              {/* Basic Example */}
              <div className="border border-zinc-200">
                <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
                      Basic Lesson
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Simple lesson with intro, vocabulary, and quiz
                    </p>
                  </div>
                  <Button
                    onClick={() => copyExample(exampleBasic)}
                    variant="outline"
                    size="sm"
                    className="border-zinc-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4">
                  <pre className="bg-zinc-900 text-zinc-100 p-4 overflow-auto text-xs rounded">
                    {JSON.stringify(exampleBasic, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Advanced Example */}
              <div className="border border-zinc-200">
                <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
                      Complete Lesson
                    </h3>
                    <p className="text-xs text-zinc-500">
                      All 6 exercise types in one lesson
                    </p>
                  </div>
                  <Button
                    onClick={() => copyExample(exampleAdvanced)}
                    variant="outline"
                    size="sm"
                    className="border-zinc-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-4">
                  <pre className="bg-zinc-900 text-zinc-100 p-4 overflow-auto text-xs rounded">
                    {JSON.stringify(exampleAdvanced, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reference" className="space-y-6">
              <div className="border border-zinc-200">
                <div className="p-4 bg-zinc-50 border-b border-zinc-200">
                  <h3 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                    Page Types Reference
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Intro */}
                  <div className="pb-4 border-b border-zinc-200">
                    <h4 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                      intro
                    </h4>
                    <p className="text-xs text-zinc-600 mb-2">Text-based introduction page</p>
                    <pre className="bg-zinc-900 text-zinc-100 p-3 text-xs rounded overflow-auto">
{`{
  "type": "intro",
  "title": "Introduction",
  "content": {
    "text": "Your introduction text here..."
  }
}`}
                    </pre>
                  </div>

                  {/* Vocabulary */}
                  <div className="pb-4 border-b border-zinc-200">
                    <h4 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                      vocabulary
                    </h4>
                    <p className="text-xs text-zinc-600 mb-2">List of words with translations</p>
                    <pre className="bg-zinc-900 text-zinc-100 p-3 text-xs rounded overflow-auto">
{`{
  "type": "vocabulary",
  "title": "New Words",
  "content": {
    "words": [
      {
        "dutch": "hallo",
        "english": "hello",
        "example": "Hallo, hoe gaat het?"
      }
    ]
  }
}`}
                    </pre>
                  </div>

                  {/* Flashcards */}
                  <div className="pb-4 border-b border-zinc-200">
                    <h4 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                      flashcards
                    </h4>
                    <p className="text-xs text-zinc-600 mb-2">Interactive flashcards</p>
                    <pre className="bg-zinc-900 text-zinc-100 p-3 text-xs rounded overflow-auto">
{`{
  "type": "flashcards",
  "title": "Practice",
  "content": {
    "cards": [
      {
        "front": "hond",
        "back": "dog"
      }
    ]
  }
}`}
                    </pre>
                  </div>

                  {/* Multiple Choice */}
                  <div className="pb-4 border-b border-zinc-200">
                    <h4 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                      multipleChoice
                    </h4>
                    <p className="text-xs text-zinc-600 mb-2">Quiz with multiple options</p>
                    <pre className="bg-zinc-900 text-zinc-100 p-3 text-xs rounded overflow-auto">
{`{
  "type": "multipleChoice",
  "title": "Quiz",
  "content": {
    "questions": [
      {
        "question": "What is 'cat'?",
        "options": ["hond", "kat", "vis", "vogel"],
        "correctIndex": 1
      }
    ]
  }
}`}
                    </pre>
                  </div>

                  {/* Fill in Blank */}
                  <div className="pb-4 border-b border-zinc-200">
                    <h4 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                      fillInBlank
                    </h4>
                    <p className="text-xs text-zinc-600 mb-2">Complete sentences (use ___ for blanks)</p>
                    <pre className="bg-zinc-900 text-zinc-100 p-3 text-xs rounded overflow-auto">
{`{
  "type": "fillInBlank",
  "title": "Fill the Blanks",
  "content": {
    "exercises": [
      {
        "sentence": "Ik heb een ___ .",
        "answer": "kat"
      }
    ]
  }
}`}
                    </pre>
                  </div>

                  {/* Matching */}
                  <div>
                    <h4 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                      matching
                    </h4>
                    <p className="text-xs text-zinc-600 mb-2">Match pairs of words</p>
                    <pre className="bg-zinc-900 text-zinc-100 p-3 text-xs rounded overflow-auto">
{`{
  "type": "matching",
  "title": "Match Words",
  "content": {
    "pairs": [
      {
        "left": "kat",
        "right": "cat"
      }
    ]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}