import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, BookOpen } from 'lucide-react';

interface ConjugationTable {
  pronoun: string;
  conjugation: string;
}

interface GrammarRule {
  id: string;
  title: string;
  category: 'verbs' | 'nouns' | 'adjectives' | 'sentence-structure' | 'other';
  explanation: string;
  examples: string[];
  conjugationTable?: ConjugationTable[];
  exceptions?: string[];
  relatedRules?: string[];
}

interface GrammarBuilderProps {
  accessToken: string;
}

export function GrammarBuilder({ accessToken }: GrammarBuilderProps) {
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [editing, setEditing] = useState<GrammarRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultRule: Partial<GrammarRule> = {
    title: '',
    category: 'verbs',
    explanation: '',
    examples: [''],
    conjugationTable: [],
    exceptions: [],
  };

  const [formData, setFormData] = useState<Partial<GrammarRule>>(defaultRule);

  useEffect(() => {
    loadGrammarRules();
  }, []);

  const loadGrammarRules = async () => {
    try {
      const data = await api.getGrammarRules(accessToken);
      setRules(data || []);
    } catch (error) {
      console.error('Failed to load grammar rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...(formData.examples || []), ''],
    });
  };

  const updateExample = (index: number, value: string) => {
    const newExamples = [...(formData.examples || [])];
    newExamples[index] = value;
    setFormData({ ...formData, examples: newExamples });
  };

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: (formData.examples || []).filter((_, i) => i !== index),
    });
  };

  const addConjugation = () => {
    setFormData({
      ...formData,
      conjugationTable: [
        ...(formData.conjugationTable || []),
        { pronoun: '', conjugation: '' },
      ],
    });
  };

  const updateConjugation = (index: number, field: 'pronoun' | 'conjugation', value: string) => {
    const newTable = [...(formData.conjugationTable || [])];
    newTable[index][field] = value;
    setFormData({ ...formData, conjugationTable: newTable });
  };

  const removeConjugation = (index: number) => {
    setFormData({
      ...formData,
      conjugationTable: (formData.conjugationTable || []).filter((_, i) => i !== index),
    });
  };

  const saveRule = async () => {
    if (!formData.title || !formData.explanation) {
      alert('Please fill in title and explanation');
      return;
    }

    try {
      if (editing) {
        // For now, we delete and recreate since we don't have update endpoint
        await api.deleteGrammarRule(accessToken, editing.id);
      }
      
      await api.createGrammarRule(accessToken, {
        ...formData,
        id: editing?.id || `grammar-${Date.now()}`,
      });

      await loadGrammarRules();
      setFormData(defaultRule);
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      alert('Failed to save grammar rule');
    }
  };

  const editRule = (rule: GrammarRule) => {
    setFormData(rule);
    setEditing(rule);
    setShowForm(true);
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this grammar rule?')) return;
    
    try {
      await api.deleteGrammarRule(accessToken, id);
      await loadGrammarRules();
    } catch (error) {
      alert('Failed to delete grammar rule');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-zinc-500">Loading grammar rules...</div>;
  }

  if (showForm) {
    return (
      <div className="bg-white border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
              {editing ? 'Edit Grammar Rule' : 'Create Grammar Rule'}
            </h2>
            <Button
              onClick={() => {
                setShowForm(false);
                setFormData(defaultRule);
                setEditing(null);
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-zinc-600 mb-2 block">Rule Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Present Tense Regular Verbs"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-600 mb-2 block">Category *</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-zinc-200 p-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="verbs">Verbs</option>
                <option value="nouns">Nouns</option>
                <option value="adjectives">Adjectives</option>
                <option value="sentence-structure">Sentence Structure</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <Label className="text-xs text-zinc-600 mb-2 block">Explanation *</Label>
            <Textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain the grammar rule in detail..."
              rows={4}
            />
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs text-zinc-600">Examples</Label>
              <Button onClick={addExample} size="sm" variant="outline">
                <Plus className="w-3 h-3 mr-1" />
                Add Example
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.examples || []).map((example, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={example}
                    onChange={(e) => updateExample(index, e.target.value)}
                    placeholder="Example sentence..."
                  />
                  <Button
                    onClick={() => removeExample(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Conjugation Table */}
          {formData.category === 'verbs' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-zinc-600">Conjugation Table</Label>
                <Button onClick={addConjugation} size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Conjugation
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.conjugationTable || []).map((conj, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      value={conj.pronoun}
                      onChange={(e) => updateConjugation(index, 'pronoun', e.target.value)}
                      placeholder="Pronoun (ik, jij, hij...)"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={conj.conjugation}
                        onChange={(e) => updateConjugation(index, 'conjugation', e.target.value)}
                        placeholder="Conjugation"
                      />
                      <Button
                        onClick={() => removeConjugation(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-2 pt-4 border-t border-zinc-200">
            <Button
              onClick={saveRule}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {editing ? 'Update Rule' : 'Create Rule'}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                setFormData(defaultRule);
                setEditing(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
                Grammar Rules
              </h2>
            </div>
            <p className="text-sm text-zinc-500">
              Create comprehensive grammar lessons with examples and conjugation tables
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div>
        {rules.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400 mb-2">No grammar rules yet</p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
            >
              Create your first rule
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {rules.map((rule) => (
              <div key={rule.id} className="p-6 hover:bg-zinc-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                        {rule.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs">
                        {rule.category}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 mb-3">{rule.explanation}</p>

                    {/* Examples */}
                    {rule.examples && rule.examples.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-zinc-500 mb-1" style={{ fontWeight: 600 }}>
                          EXAMPLES:
                        </div>
                        <ul className="space-y-1">
                          {rule.examples.map((ex, i) => (
                            <li key={i} className="text-sm text-zinc-700">
                              • {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Conjugation Table */}
                    {rule.conjugationTable && rule.conjugationTable.length > 0 && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200">
                        <div className="text-xs text-zinc-600 mb-2" style={{ fontWeight: 600 }}>
                          CONJUGATION:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {rule.conjugationTable.map((conj, i) => (
                            <div key={i} className="flex gap-2 text-sm">
                              <span className="text-zinc-500">{conj.pronoun}</span>
                              <span className="text-zinc-900" style={{ fontWeight: 600 }}>
                                {conj.conjugation}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => editRule(rule)}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteRule(rule.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
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