import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Trophy, Clock, Target, TrendingUp, Calendar } from 'lucide-react';

interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  passed: boolean;
  completedAt: string;
  attempts: number;
  mistakes: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }>;
}

interface TestResultsProps {
  accessToken: string;
}

export function TestResults({ accessToken }: TestResultsProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await api.getTestResults(accessToken);
      setResults(data || []);
    } catch (error) {
      console.error('Failed to load test results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-zinc-500">Loading results...</div>;
  }

  if (selectedResult) {
    return (
      <div className="bg-white border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <button
            onClick={() => setSelectedResult(null)}
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-2"
          >
            ← Back to all results
          </button>
          <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
            {selectedResult.testTitle} - Detailed Results
          </h2>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Student</div>
              <div className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                {selectedResult.studentName}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Score</div>
              <div className={`text-sm ${selectedResult.passed ? 'text-green-600' : 'text-red-600'}`} style={{ fontWeight: 600 }}>
                {selectedResult.score}/{selectedResult.totalPoints} ({selectedResult.percentage}%)
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Time Spent</div>
              <div className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                {Math.floor(selectedResult.timeSpent / 60)}m {selectedResult.timeSpent % 60}s
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Attempts</div>
              <div className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                {selectedResult.attempts}
              </div>
            </div>
          </div>
        </div>

        {/* Mistakes */}
        <div className="p-6">
          <h3 className="text-sm text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
            Mistakes to Review ({selectedResult.mistakes.length})
          </h3>
          {selectedResult.mistakes.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-green-600" style={{ fontWeight: 600 }}>
                Perfect Score! No mistakes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedResult.mistakes.map((mistake, index) => (
                <div key={index} className="p-4 bg-red-50 border border-red-200">
                  <div className="text-sm text-zinc-900 mb-2" style={{ fontWeight: 600 }}>
                    {mistake.question}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Your Answer</div>
                      <div className="text-red-600">{mistake.userAnswer}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Correct Answer</div>
                      <div className="text-green-600">{mistake.correctAnswer}</div>
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

  return (
    <div className="bg-white border border-zinc-200">
      <div className="p-6 border-b border-zinc-200">
        <h2 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
          Test Results & Analytics
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Track Xindy's test performance and progress
        </p>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-zinc-400 mb-2">No test results yet</p>
          <p className="text-sm text-zinc-500">Results will appear here after tests are completed</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => setSelectedResult(result)}
              className="w-full p-6 text-left hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                      {result.testTitle}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs ${
                        result.passed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>
                        {result.score}/{result.totalPoints} ({result.percentage}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(result.timeSpent / 60)}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Attempt {result.attempts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div
                    className={`text-3xl ${
                      result.percentage >= 90
                        ? 'text-green-600'
                        : result.percentage >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {result.percentage}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-zinc-200 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    result.passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.percentage}%` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
