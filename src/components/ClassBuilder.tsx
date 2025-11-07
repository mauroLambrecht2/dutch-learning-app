import { useState } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Page {
  id: string;
  type: 'intro' | 'vocabulary' | 'flashcards' | 'multipleChoice' | 'fillInBlank' | 'matching' | 'wordScramble' | 'listening' | 'dragDrop' | 'speedRound';
  title: string;
  content: any;
}

interface ClassBuilderProps {
  accessToken: string;
  existingClass?: any;
  days: any[];
  onSave: () => void;
  onCancel: () => void;
}

const PAGE_TYPE_INFO = {
  intro: { label: 'Introduction', description: 'Text-based introduction to the lesson' },
  vocabulary: { label: 'Vocabulary List', description: 'List of Dutch words with translations' },
  flashcards: { label: 'Flashcards', description: 'Interactive flash cards for memorization' },
  multipleChoice: { label: 'Multiple Choice', description: 'Quiz with multiple choice questions' },
  fillInBlank: { label: 'Fill in the Blank', description: 'Complete sentences with missing words' },
  matching: { label: 'Matching Exercise', description: 'Match Dutch words to English translations' },
  wordScramble: { label: 'Word Scramble', description: 'Unscramble Dutch words' },
  listening: { label: 'Listening Exercise', description: 'Listen to Dutch audio and answer questions' },
  dragDrop: { label: 'Drag and Drop', description: 'Drag Dutch words to their correct English translations' },
  speedRound: { label: 'Speed Round', description: 'Quickly match Dutch words to English translations' },
};

export function ClassBuilder({ accessToken, existingClass, days, onSave, onCancel }: ClassBuilderProps) {
  const [title, setTitle] = useState(existingClass?.title || '');
  const [description, setDescription] = useState(existingClass?.description || '');
  const [selectedDay, setSelectedDay] = useState(existingClass?.dayId || '');
  const [pages, setPages] = useState<Page[]>(existingClass?.pages || []);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const addPage = (type: Page['type']) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      type,
      title: '',
      content: getDefaultContent(type),
    };
    setPages([...pages, newPage]);
    setSelectedPageIndex(pages.length);
  };

  const getDefaultContent = (type: Page['type']) => {
    switch (type) {
      case 'intro':
        return { text: '' };
      case 'vocabulary':
        return { words: [{ dutch: '', english: '', example: '' }] };
      case 'flashcards':
        return { cards: [{ front: '', back: '' }] };
      case 'multipleChoice':
        return { questions: [{ question: '', options: ['', '', '', ''], correctIndex: 0 }] };
      case 'fillInBlank':
        return { exercises: [{ sentence: '', answer: '' }] };
      case 'matching':
        return { pairs: [{ left: '', right: '' }] };
      case 'wordScramble':
        return { words: [{ scrambled: '', correct: '' }] };
      case 'listening':
        return { audioUrl: '', questions: [{ question: '', options: ['', '', '', ''], correctIndex: 0 }] };
      case 'dragDrop':
        return { pairs: [{ left: '', right: '' }] };
      case 'speedRound':
        return { pairs: [{ left: '', right: '' }] };
      default:
        return {};
    }
  };

  const updatePage = (index: number, updates: Partial<Page>) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], ...updates };
    setPages(newPages);
  };

  const deletePage = (index: number) => {
    if (confirm('Delete this page?')) {
      setPages(pages.filter((_, i) => i !== index));
      setSelectedPageIndex(null);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
    setPages(newPages);
    setSelectedPageIndex(newIndex);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a lesson title');
      return;
    }

    setSaving(true);
    try {
      await api.createClass(accessToken, {
        id: existingClass?.id,
        title,
        description,
        dayId: selectedDay,
        pages,
      });
      onSave();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const selectedPage = selectedPageIndex !== null ? pages[selectedPageIndex] : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onCancel} variant="ghost" size="sm" className="hover:bg-zinc-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lessons
              </Button>
              <div className="h-6 w-px bg-zinc-200"></div>
              <div>
                <h1 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
                  {existingClass ? 'Edit Lesson' : 'Create New Lesson'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                size="sm"
                className="border-zinc-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Lesson'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Lesson Info & Pages */}
          <div className="col-span-3 space-y-4">
            {/* Lesson Details */}
            <div className="bg-white border border-zinc-200">
              <div className="p-4 border-b border-zinc-200">
                <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                  Lesson Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block" style={{ fontWeight: 500 }}>
                    Title *
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Basic Greetings"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block" style={{ fontWeight: 500 }}>
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what students will learn"
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block" style={{ fontWeight: 500 }}>
                    Chapter
                  </Label>
                  <select
                    className="w-full border border-zinc-200 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="">No chapter</option>
                    {days.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pages List */}
            <div className="bg-white border border-zinc-200">
              <div className="p-4 border-b border-zinc-200">
                <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                  Lesson Pages ({pages.length})
                </h2>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {pages.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs text-zinc-400 mb-2">No pages yet</p>
                    <p className="text-xs text-zinc-500">Add pages to build your lesson</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {pages.map((page, index) => (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPageIndex(index)}
                        className={`w-full text-left p-3 text-xs transition-colors ${
                          selectedPageIndex === index
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-zinc-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-zinc-400" style={{ fontWeight: 500 }}>
                                {index + 1}.
                              </span>
                              <span className="text-zinc-600" style={{ fontWeight: 500 }}>
                                {PAGE_TYPE_INFO[page.type].label}
                              </span>
                            </div>
                            <p className="text-zinc-900 truncate" style={{ fontWeight: 500 }}>
                              {page.title || 'Untitled'}
                            </p>
                          </div>
                          {selectedPageIndex === index && (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  movePage(index, 'up');
                                }}
                                disabled={index === 0}
                                className="p-0.5 hover:bg-indigo-100 disabled:opacity-30"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  movePage(index, 'down');
                                }}
                                disabled={index === pages.length - 1}
                                className="p-0.5 hover:bg-indigo-100 disabled:opacity-30"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Page */}
            <div className="bg-white border border-zinc-200">
              <div className="p-4 border-b border-zinc-200">
                <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                  Add Page
                </h2>
              </div>
              <div className="p-2 space-y-1">
                {(Object.keys(PAGE_TYPE_INFO) as Page['type'][]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addPage(type)}
                    className="w-full text-left p-3 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors"
                  >
                    <div className="text-xs text-zinc-900 mb-1" style={{ fontWeight: 500 }}>
                      {PAGE_TYPE_INFO[type].label}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {PAGE_TYPE_INFO[type].description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className={showPreview ? 'col-span-5' : 'col-span-9'}>
            {selectedPage ? (
              <div className="bg-white border border-zinc-200">
                <div className="p-4 border-b border-zinc-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1" style={{ fontWeight: 500 }}>
                        Page {(selectedPageIndex || 0) + 1} • {PAGE_TYPE_INFO[selectedPage.type].label}
                      </div>
                      <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                        Edit Page Content
                      </h2>
                    </div>
                    <Button
                      onClick={() => deletePage(selectedPageIndex!)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Page
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <PageEditor
                    page={selectedPage}
                    onChange={(updates) => updatePage(selectedPageIndex!, updates)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 p-20 text-center">
                <div className="text-zinc-400 mb-4">
                  <Plus className="w-12 h-12 mx-auto opacity-40" />
                </div>
                <h3 className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                  No page selected
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Select a page from the left sidebar or add a new page to get started
                </p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="col-span-4">
              <div className="bg-zinc-900 border border-zinc-800 sticky top-6">
                <div className="p-4 border-b border-zinc-700">
                  <h2 className="text-sm text-white" style={{ fontWeight: 600 }}>
                    Preview
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    How learners will see this page
                  </p>
                </div>
                <div className="p-6 bg-white min-h-96">
                  {selectedPage ? (
                    <PagePreview page={selectedPage} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xs text-zinc-400">Select a page to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Page Editor Component
function PageEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const renderEditor = () => {
    switch (page.type) {
      case 'intro':
        return <IntroEditor page={page} onChange={onChange} />;
      case 'vocabulary':
        return <VocabularyEditor page={page} onChange={onChange} />;
      case 'flashcards':
        return <FlashcardsEditor page={page} onChange={onChange} />;
      case 'multipleChoice':
        return <MultipleChoiceEditor page={page} onChange={onChange} />;
      case 'fillInBlank':
        return <FillInBlankEditor page={page} onChange={onChange} />;
      case 'matching':
        return <MatchingEditor page={page} onChange={onChange} />;
      case 'wordScramble':
        return <WordScrambleEditor page={page} onChange={onChange} />;
      case 'listening':
        return <ListeningEditor page={page} onChange={onChange} />;
      case 'dragDrop':
        return <DragDropEditor page={page} onChange={onChange} />;
      case 'speedRound':
        return <SpeedRoundEditor page={page} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs text-zinc-600 mb-2 block" style={{ fontWeight: 500 }}>
          Page Title *
        </Label>
        <Input
          value={page.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Common Greetings"
          className="text-sm"
        />
        <p className="text-xs text-zinc-400 mt-1">This appears as the page heading</p>
      </div>
      {renderEditor()}
    </div>
  );
}

// Individual Editors
function IntroEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  return (
    <div>
      <Label className="text-xs text-zinc-600 mb-2 block" style={{ fontWeight: 500 }}>
        Introduction Text
      </Label>
      <Textarea
        value={page.content?.text || ''}
        onChange={(e) => onChange({ content: { text: e.target.value } })}
        rows={10}
        placeholder="Write an introduction to this lesson..."
        className="text-sm font-mono"
      />
      <p className="text-xs text-zinc-400 mt-1">Explain what students will learn in this lesson</p>
    </div>
  );
}

function VocabularyEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const words = page.content?.words || [];

  const updateWord = (index: number, field: string, value: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    onChange({ content: { words: newWords } });
  };

  const addWord = () => {
    onChange({ content: { words: [...words, { dutch: '', english: '', example: '' }] } });
  };

  const removeWord = (index: number) => {
    onChange({ content: { words: words.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Vocabulary Words
      </Label>
      {words.map((word: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Word {index + 1}</span>
            <button
              onClick={() => removeWord(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-600 mb-1 block">Dutch</Label>
                <Input
                  value={word.dutch || ''}
                  onChange={(e) => updateWord(index, 'dutch', e.target.value)}
                  placeholder="hallo"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-600 mb-1 block">English</Label>
                <Input
                  value={word.english || ''}
                  onChange={(e) => updateWord(index, 'english', e.target.value)}
                  placeholder="hello"
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Example Sentence (Optional)</Label>
              <Input
                value={word.example || ''}
                onChange={(e) => updateWord(index, 'example', e.target.value)}
                placeholder="Hallo, hoe gaat het?"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addWord} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Vocabulary Word
      </Button>
    </div>
  );
}

function FlashcardsEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const cards = page.content?.cards || [];

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange({ content: { cards: newCards } });
  };

  const addCard = () => {
    onChange({ content: { cards: [...cards, { front: '', back: '' }] } });
  };

  const removeCard = (index: number) => {
    onChange({ content: { cards: cards.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Flashcards
      </Label>
      {cards.map((card: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Card {index + 1}</span>
            <button
              onClick={() => removeCard(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Front (Dutch)</Label>
              <Input
                value={card.front || ''}
                onChange={(e) => updateCard(index, 'front', e.target.value)}
                placeholder="goedemorgen"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Back (English)</Label>
              <Input
                value={card.back || ''}
                onChange={(e) => updateCard(index, 'back', e.target.value)}
                placeholder="good morning"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addCard} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Flashcard
      </Button>
    </div>
  );
}

function MultipleChoiceEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const questions = page.content?.questions || [];

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onChange({ content: { questions: newQuestions } });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    onChange({ content: { questions: newQuestions } });
  };

  const addQuestion = () => {
    onChange({ content: { questions: [...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }] } });
  };

  const removeQuestion = (index: number) => {
    onChange({ content: { questions: questions.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Multiple Choice Questions
      </Label>
      {questions.map((q: any, qIndex: number) => (
        <div key={qIndex} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Question {qIndex + 1}</span>
            <button
              onClick={() => removeQuestion(qIndex)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Question</Label>
              <Input
                value={q.question || ''}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="What does 'hallo' mean?"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-2 block">Options (select correct answer)</Label>
              <div className="space-y-2">
                {q.options.map((opt: string, optIndex: number) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.correctIndex === optIndex}
                      onChange={() => updateQuestion(qIndex, 'correctIndex', optIndex)}
                      className="w-4 h-4"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addQuestion} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}

function FillInBlankEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const exercises = page.content?.exercises || [];

  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    onChange({ content: { exercises: newExercises } });
  };

  const addExercise = () => {
    onChange({ content: { exercises: [...exercises, { sentence: '', answer: '' }] } });
  };

  const removeExercise = (index: number) => {
    onChange({ content: { exercises: exercises.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-zinc-600 mb-1 block" style={{ fontWeight: 500 }}>
          Fill in the Blank Exercises
        </Label>
        <p className="text-xs text-zinc-400">Use ___ (three underscores) where the blank should be</p>
      </div>
      {exercises.map((ex: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Exercise {index + 1}</span>
            <button
              onClick={() => removeExercise(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Sentence with blank</Label>
              <Input
                value={ex.sentence || ''}
                onChange={(e) => updateExercise(index, 'sentence', e.target.value)}
                placeholder="Ik ___ Nederlands."
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Correct Answer</Label>
              <Input
                value={ex.answer || ''}
                onChange={(e) => updateExercise(index, 'answer', e.target.value)}
                placeholder="spreek"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addExercise} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Exercise
      </Button>
    </div>
  );
}

function MatchingEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const pairs = page.content?.pairs || [];

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange({ content: { pairs: newPairs } });
  };

  const addPair = () => {
    onChange({ content: { pairs: [...pairs, { left: '', right: '' }] } });
  };

  const removePair = (index: number) => {
    onChange({ content: { pairs: pairs.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Matching Pairs
      </Label>
      {pairs.map((pair: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Pair {index + 1}</span>
            <button
              onClick={() => removePair(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Dutch</Label>
              <Input
                value={pair.left || ''}
                onChange={(e) => updatePair(index, 'left', e.target.value)}
                placeholder="dag"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">English</Label>
              <Input
                value={pair.right || ''}
                onChange={(e) => updatePair(index, 'right', e.target.value)}
                placeholder="day"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addPair} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Matching Pair
      </Button>
    </div>
  );
}

function WordScrambleEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const words = page.content?.words || [];

  const updateWord = (index: number, field: string, value: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    onChange({ content: { words: newWords } });
  };

  const addWord = () => {
    onChange({ content: { words: [...words, { scrambled: '', correct: '' }] } });
  };

  const removeWord = (index: number) => {
    onChange({ content: { words: words.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Word Scramble
      </Label>
      {words.map((word: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Word {index + 1}</span>
            <button
              onClick={() => removeWord(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Scrambled Word</Label>
              <Input
                value={word.scrambled || ''}
                onChange={(e) => updateWord(index, 'scrambled', e.target.value)}
                placeholder="gootemorgn"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Correct Word</Label>
              <Input
                value={word.correct || ''}
                onChange={(e) => updateWord(index, 'correct', e.target.value)}
                placeholder="goedemorgen"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addWord} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Word Scramble
      </Button>
    </div>
  );
}

function ListeningEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const questions = page.content?.questions || [];

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onChange({ content: { questions: newQuestions } });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    onChange({ content: { questions: newQuestions } });
  };

  const addQuestion = () => {
    onChange({ content: { questions: [...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }] } });
  };

  const removeQuestion = (index: number) => {
    onChange({ content: { questions: questions.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Listening Questions
      </Label>
      {questions.map((q: any, qIndex: number) => (
        <div key={qIndex} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Question {qIndex + 1}</span>
            <button
              onClick={() => removeQuestion(qIndex)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Question</Label>
              <Input
                value={q.question || ''}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="What does 'hallo' mean?"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-2 block">Options (select correct answer)</Label>
              <div className="space-y-2">
                {q.options.map((opt: string, optIndex: number) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.correctIndex === optIndex}
                      onChange={() => updateQuestion(qIndex, 'correctIndex', optIndex)}
                      className="w-4 h-4"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addQuestion} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}

function DragDropEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const pairs = page.content?.pairs || [];

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange({ content: { pairs: newPairs } });
  };

  const addPair = () => {
    onChange({ content: { pairs: [...pairs, { left: '', right: '' }] } });
  };

  const removePair = (index: number) => {
    onChange({ content: { pairs: pairs.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Drag and Drop Pairs
      </Label>
      {pairs.map((pair: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Pair {index + 1}</span>
            <button
              onClick={() => removePair(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Dutch</Label>
              <Input
                value={pair.left || ''}
                onChange={(e) => updatePair(index, 'left', e.target.value)}
                placeholder="dag"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">English</Label>
              <Input
                value={pair.right || ''}
                onChange={(e) => updatePair(index, 'right', e.target.value)}
                placeholder="day"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addPair} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Drag and Drop Pair
      </Button>
    </div>
  );
}

function SpeedRoundEditor({ page, onChange }: { page: Page; onChange: (updates: Partial<Page>) => void }) {
  const pairs = page.content?.pairs || [];

  const updatePair = (index: number, field: string, value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange({ content: { pairs: newPairs } });
  };

  const addPair = () => {
    onChange({ content: { pairs: [...pairs, { left: '', right: '' }] } });
  };

  const removePair = (index: number) => {
    onChange({ content: { pairs: pairs.filter((_: any, i: number) => i !== index) } });
  };

  return (
    <div className="space-y-4">
      <Label className="text-xs text-zinc-600" style={{ fontWeight: 500 }}>
        Speed Round Pairs
      </Label>
      {pairs.map((pair: any, index: number) => (
        <div key={index} className="p-4 bg-zinc-50 border border-zinc-200">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500" style={{ fontWeight: 500 }}>Pair {index + 1}</span>
            <button
              onClick={() => removePair(index)}
              className="text-xs text-red-600 hover:text-red-700"
              style={{ fontWeight: 500 }}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">Dutch</Label>
              <Input
                value={pair.left || ''}
                onChange={(e) => updatePair(index, 'left', e.target.value)}
                placeholder="dag"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-1 block">English</Label>
              <Input
                value={pair.right || ''}
                onChange={(e) => updatePair(index, 'right', e.target.value)}
                placeholder="day"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addPair} variant="outline" size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Speed Round Pair
      </Button>
    </div>
  );
}

// Simple Preview Component
function PagePreview({ page }: { page: Page }) {
  return (
    <div>
      <h3 className="text-lg text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
        {page.title || 'Untitled Page'}
      </h3>
      <div className="text-sm text-zinc-600">
        {page.type === 'intro' && <p className="whitespace-pre-wrap">{page.content?.text || 'No content yet'}</p>}
        {page.type === 'vocabulary' && (
          <div className="space-y-2">
            {(page.content?.words || []).map((word: any, i: number) => (
              <div key={i} className="p-3 bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between mb-1">
                  <span style={{ fontWeight: 600 }}>{word.dutch || '—'}</span>
                  <span className="text-zinc-500">{word.english || '—'}</span>
                </div>
                {word.example && <p className="text-xs text-zinc-400 italic">{word.example}</p>}
              </div>
            ))}
          </div>
        )}
        {page.type === 'flashcards' && (
          <div className="text-center p-8 bg-zinc-50 border border-zinc-200">
            <p className="text-xs text-zinc-400">
              {(page.content?.cards || []).length} flashcard(s)
            </p>
          </div>
        )}
        {page.type === 'multipleChoice' && (
          <div className="space-y-3">
            {(page.content?.questions || []).map((q: any, i: number) => (
              <div key={i} className="space-y-2">
                <p style={{ fontWeight: 500 }}>{q.question || 'Question'}</p>
                <div className="space-y-1">
                  {(q.options || []).map((opt: string, j: number) => (
                    <div key={j} className="p-2 bg-zinc-50 border border-zinc-200 text-xs">
                      {opt || `Option ${j + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {page.type === 'fillInBlank' && (
          <div className="space-y-2">
            {(page.content?.exercises || []).map((ex: any, i: number) => (
              <div key={i} className="p-3 bg-zinc-50 border border-zinc-200">
                <p>{ex.sentence || 'Sentence'}</p>
              </div>
            ))}
          </div>
        )}
        {page.type === 'matching' && (
          <div className="space-y-2">
            {(page.content?.pairs || []).map((pair: any, i: number) => (
              <div key={i} className="flex justify-between p-3 bg-zinc-50 border border-zinc-200">
                <span>{pair.left || '—'}</span>
                <span className="text-zinc-400">↔</span>
                <span>{pair.right || '—'}</span>
              </div>
            ))}
          </div>
        )}
        {page.type === 'wordScramble' && (
          <div className="space-y-2">
            {(page.content?.words || []).map((word: any, i: number) => (
              <div key={i} className="p-3 bg-zinc-50 border border-zinc-200">
                <p>{word.scrambled || 'Scrambled Word'}</p>
              </div>
            ))}
          </div>
        )}
        {page.type === 'listening' && (
          <div className="space-y-3">
            {(page.content?.questions || []).map((q: any, i: number) => (
              <div key={i} className="space-y-2">
                <p style={{ fontWeight: 500 }}>{q.question || 'Question'}</p>
                <div className="space-y-1">
                  {(q.options || []).map((opt: string, j: number) => (
                    <div key={j} className="p-2 bg-zinc-50 border border-zinc-200 text-xs">
                      {opt || `Option ${j + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {page.type === 'dragDrop' && (
          <div className="space-y-2">
            {(page.content?.pairs || []).map((pair: any, i: number) => (
              <div key={i} className="flex justify-between p-3 bg-zinc-50 border border-zinc-200">
                <span>{pair.left || '—'}</span>
                <span className="text-zinc-400">↔</span>
                <span>{pair.right || '—'}</span>
              </div>
            ))}
          </div>
        )}
        {page.type === 'speedRound' && (
          <div className="space-y-2">
            {(page.content?.pairs || []).map((pair: any, i: number) => (
              <div key={i} className="flex justify-between p-3 bg-zinc-50 border border-zinc-200">
                <span>{pair.left || '—'}</span>
                <span className="text-zinc-400">↔</span>
                <span>{pair.right || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}