import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Save, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface TestQuestion {
  id: string;
  type: 'multipleChoice' | 'fillInBlank' | 'translation' | 'listening' | 'matching';
  question: string;
  correctAnswer: string;
  options?: string[];
  points: number;
}

interface TestBuilderProps {
  accessToken: string;
  existingTest?: any;
  onSave: () => void;
  onCancel: () => void;
}

export function TestBuilder({ accessToken, existingTest, onSave, onCancel }: TestBuilderProps) {
  const [title, setTitle] = useState(existingTest?.title || '');
  const [description, setDescription] = useState(existingTest?.description || '');
  const [timeLimit, setTimeLimit] = useState(existingTest?.timeLimit || 30);
  const [passingScore, setPassingScore] = useState(existingTest?.passingScore || 70);
  const [allowRetake, setAllowRetake] = useState(existingTest?.allowRetake ?? true);
  const [showMistakes, setShowMistakes] = useState(existingTest?.showMistakes ?? true);
  const [includeVocab, setIncludeVocab] = useState(existingTest?.includeVocab ?? true);
  const [questions, setQuestions] = useState<TestQuestion[]>(existingTest?.questions || []);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const data = await api.getVocabulary(accessToken);
      setVocabulary(data || []);
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    }
  };

  const addQuestion = (type: TestQuestion['type']) => {
    const newQuestion: TestQuestion = {
      id: `q-${Date.now()}`,
      type,
      question: '',
      correctAnswer: '',
      options: type === 'multipleChoice' ? ['', '', '', ''] : undefined,
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<TestQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    if (confirm('Delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const generateFromVocabulary = () => {
    if (vocabulary.length === 0) {
      alert('No vocabulary available. Add some vocabulary first!');
      return;
    }

    const newQuestions: TestQuestion[] = [];

    // Generate translation questions
    vocabulary.slice(0, 10).forEach(word => {
      newQuestions.push({
        id: `q-${Date.now()}-${Math.random()}`,
        type: 'translation',
        question: `Translate to English: ${word.dutch}`,
        correctAnswer: word.english,
        points: 1,
      });
    });

    // Generate multiple choice questions
    vocabulary.slice(0, 5).forEach((word, idx) => {
      const wrongOptions = vocabulary
        .filter(w => w.id !== word.id)
        .map(w => w.english)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allOptions = [word.english, ...wrongOptions].sort(() => Math.random() - 0.5);

      newQuestions.push({
        id: `q-${Date.now()}-mc-${idx}`,
        type: 'multipleChoice',
        question: `What does "${word.dutch}" mean?`,
        correctAnswer: word.english,
        options: allOptions,
        points: 1,
      });
    });

    setQuestions([...questions, ...newQuestions]);
    alert(`Added ${newQuestions.length} questions from vocabulary!`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a test title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setSaving(true);
    try {
      await api.createTest(accessToken, {
        id: existingTest?.id,
        title,
        description,
        timeLimit,
        passingScore,
        allowRetake,
        showMistakes,
        includeVocab,
        questions,
      });
      onSave();
    } catch (error) {
      console.error('Failed to save test:', error);
      alert('Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onCancel} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-zinc-200"></div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h1 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
                  {existingTest ? 'Edit Test' : 'Create New Test'}
                </h1>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Test'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Settings Panel */}
          <div className="col-span-4 space-y-4">
            {/* Basic Info */}
            <div className="bg-white border border-zinc-200 p-6">
              <h2 className="text-sm text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
                Test Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block">Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Chapter 1 Test"
                  />
                </div>
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Test your knowledge..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Test Settings */}
            <div className="bg-white border border-zinc-200 p-6">
              <h2 className="text-sm text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
                Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block">
                    Time Limit (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs text-zinc-600 mb-2 block">
                    Passing Score (%)
                  </Label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="allowRetake"
                    checked={allowRetake}
                    onCheckedChange={(checked) => setAllowRetake(!!checked)}
                  />
                  <Label htmlFor="allowRetake" className="text-sm text-zinc-700 cursor-pointer">
                    Allow retakes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showMistakes"
                    checked={showMistakes}
                    onCheckedChange={(checked) => setShowMistakes(!!checked)}
                  />
                  <Label htmlFor="showMistakes" className="text-sm text-zinc-700 cursor-pointer">
                    Show mistakes after completion
                  </Label>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-zinc-200 p-6">
              <h2 className="text-sm text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
                Quick Actions
              </h2>
              <Button
                onClick={generateFromVocabulary}
                variant="outline"
                className="w-full"
                disabled={vocabulary.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate from Vocabulary ({vocabulary.length} words)
              </Button>
              <p className="text-xs text-zinc-500 mt-2">
                Automatically create questions from your vocabulary library
              </p>
            </div>

            {/* Stats */}
            <div className="bg-indigo-50 border border-indigo-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-indigo-600 mb-1" style={{ fontWeight: 600 }}>
                    QUESTIONS
                  </div>
                  <div className="text-2xl text-indigo-900" style={{ fontWeight: 700 }}>
                    {questions.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-indigo-600 mb-1" style={{ fontWeight: 600 }}>
                    TOTAL POINTS
                  </div>
                  <div className="text-2xl text-indigo-900" style={{ fontWeight: 700 }}>
                    {totalPoints}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="col-span-8">
            <div className="bg-white border border-zinc-200">
              <div className="p-6 border-b border-zinc-200">
                <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
                  Test Questions
                </h2>
              </div>

              {/* Add Question Buttons */}
              <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => addQuestion('multipleChoice')}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Multiple Choice
                  </Button>
                  <Button
                    onClick={() => addQuestion('fillInBlank')}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Fill in Blank
                  </Button>
                  <Button
                    onClick={() => addQuestion('translation')}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Translation
                  </Button>
                  <Button
                    onClick={() => addQuestion('matching')}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Matching
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-zinc-200">
                {questions.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-zinc-400 mb-2">No questions yet</p>
                    <p className="text-sm text-zinc-500">Add questions above or generate from vocabulary</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div key={question.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500" style={{ fontWeight: 600 }}>
                            Q{index + 1}
                          </span>
                          <span className="px-2 py-1 bg-zinc-100 text-xs text-zinc-600">
                            {question.type}
                          </span>
                        </div>
                        <Button
                          onClick={() => deleteQuestion(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-zinc-600 mb-1.5 block">Question</Label>
                          <Input
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(index, { question: e.target.value })
                            }
                            placeholder="Enter question..."
                          />
                        </div>

                        {question.type === 'multipleChoice' && (
                          <div>
                            <Label className="text-xs text-zinc-600 mb-1.5 block">Options</Label>
                            <div className="space-y-2">
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={question.correctAnswer === option}
                                    onChange={() =>
                                      updateQuestion(index, { correctAnswer: option })
                                    }
                                    className="text-indigo-600"
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optIndex] = e.target.value;
                                      updateQuestion(index, { options: newOptions });
                                    }}
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type !== 'multipleChoice' && (
                          <div>
                            <Label className="text-xs text-zinc-600 mb-1.5 block">Correct Answer</Label>
                            <Input
                              value={question.correctAnswer}
                              onChange={(e) =>
                                updateQuestion(index, { correctAnswer: e.target.value })
                              }
                              placeholder="Enter correct answer..."
                            />
                          </div>
                        )}

                        <div className="w-32">
                          <Label className="text-xs text-zinc-600 mb-1.5 block">Points</Label>
                          <Input
                            type="number"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(index, { points: parseInt(e.target.value) || 1 })
                            }
                            min={1}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
