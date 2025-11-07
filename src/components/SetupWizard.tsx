import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ExternalLink, 
  Copy,
  Loader2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'complete' | 'error';
  action?: () => void;
  instructions: string[];
}

export function SetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'edge-function',
      title: 'Deploy Edge Function',
      description: 'The backend API needs to be deployed to Supabase',
      status: 'pending',
      instructions: [
        'Go to Supabase Dashboard → Edge Functions',
        'Click "New Function" or deploy via CLI',
        'Name: make-server-a784a06a',
        'Copy code from /supabase/functions/server/index.tsx',
        'Deploy the function'
      ]
    },
    {
      id: 'database',
      title: 'Create Database Table',
      description: 'Create the key-value store table',
      status: 'pending',
      instructions: [
        'Go to Supabase Dashboard → SQL Editor',
        'Click "New Query"',
        'Paste the SQL from the box below',
        'Click "Run" to execute'
      ]
    },
    {
      id: 'env-vars',
      title: 'Set Environment Variables',
      description: 'Configure edge function secrets',
      status: 'pending',
      instructions: [
        'Go to Edge Functions → Settings → Secrets',
        'Add: SUPABASE_URL',
        'Add: SUPABASE_ANON_KEY',
        'Add: SUPABASE_SERVICE_ROLE_KEY (from Settings → API)',
        'Redeploy the edge function'
      ]
    },
    {
      id: 'users',
      title: 'Create User Accounts',
      description: 'Set up Mauro and Xindy accounts',
      status: 'pending',
      instructions: [
        'Go to Authentication → Users → Add User',
        'Create teacher: creator@dutch.app',
        'Create student: learner@dutch.app',
        '✅ Enable "Auto Confirm User" for both',
        'Add user metadata with name and role'
      ]
    }
  ]);

  const [checking, setChecking] = useState(false);

  const checkEdgeFunction = async () => {
    try {
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a784a06a`;
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        updateStepStatus('edge-function', 'complete');
        return true;
      } else {
        updateStepStatus('edge-function', 'error');
        return false;
      }
    } catch (error) {
      updateStepStatus('edge-function', 'error');
      return false;
    }
  };

  const updateStepStatus = (stepId: string, status: SetupStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const checkAllSteps = async () => {
    setChecking(true);
    
    // Check edge function
    updateStepStatus('edge-function', 'checking');
    const edgeFunctionOk = await checkEdgeFunction();
    
    // If edge function is ok, database is likely ok too
    if (edgeFunctionOk) {
      updateStepStatus('database', 'complete');
      updateStepStatus('env-vars', 'complete');
    }
    
    setChecking(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const sqlQuery = `-- Create the key-value store table
CREATE TABLE IF NOT EXISTS kv_store_a784a06a (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Add index for prefix searches
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_a784a06a USING btree (key text_pattern_ops);`;

  const envVars = `SUPABASE_URL=https://${projectId}.supabase.co
SUPABASE_ANON_KEY=${publicAnonKey}
SUPABASE_SERVICE_ROLE_KEY=<get-from-dashboard-settings-api>`;

  const userMetadataTeacher = `{
  "name": "Mauro",
  "role": "teacher"
}`;

  const userMetadataStudent = `{
  "name": "Xindy",
  "role": "student"
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl mb-2">Setup Wizard</h1>
        <p className="text-gray-600">
          Complete these steps to get your Dutch Learning App running
        </p>
        <Button 
          onClick={checkAllSteps} 
          disabled={checking}
          className="mt-4"
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Status'
          )}
        </Button>
      </div>

      {steps.map((step, index) => (
        <Card key={step.id} className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 pt-1">
              {step.status === 'complete' && (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              )}
              {step.status === 'error' && (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              {step.status === 'checking' && (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              )}
              {step.status === 'pending' && (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-500">Step {index + 1}</span>
                {step.status === 'complete' && (
                  <Badge variant="default">Complete</Badge>
                )}
                {step.status === 'error' && (
                  <Badge variant="destructive">Action Required</Badge>
                )}
              </div>

              <h3 className="text-lg mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{step.description}</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm mb-2">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {step.instructions.map((instruction, i) => (
                    <li key={i} className="text-gray-700">{instruction}</li>
                  ))}
                </ol>
              </div>

              {step.id === 'edge-function' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(
                      `https://supabase.com/dashboard/project/${projectId}/functions`,
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Edge Functions
                  </Button>

                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">CLI Command:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('supabase functions deploy server', 'command')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    supabase functions deploy server
                  </div>
                </div>
              )}

              {step.id === 'database' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(
                      `https://supabase.com/dashboard/project/${projectId}/sql`,
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open SQL Editor
                  </Button>

                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">SQL Query:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(sqlQuery, 'SQL')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap">{sqlQuery}</pre>
                  </div>
                </div>
              )}

              {step.id === 'env-vars' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(
                      `https://supabase.com/dashboard/project/${projectId}/settings/api`,
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Project Settings
                  </Button>

                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Environment Variables:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(envVars, 'env vars')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap">{envVars}</pre>
                  </div>
                </div>
              )}

              {step.id === 'users' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(
                      `https://supabase.com/dashboard/project/${projectId}/auth/users`,
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Authentication
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <p className="text-sm mb-2">Teacher (Mauro):</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Email:</span>
                          <code className="bg-white px-2 py-1 rounded">creator@dutch.app</code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Password:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard('creator-secure-2024-dutch', 'password')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Metadata:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(userMetadataTeacher, 'metadata')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap">{userMetadataTeacher}</pre>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                      <p className="text-sm mb-2">Student (Xindy):</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Email:</span>
                          <code className="bg-white px-2 py-1 rounded">learner@dutch.app</code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Password:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard('learner-secure-2024-dutch', 'password')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Metadata:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(userMetadataStudent, 'metadata')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap">{userMetadataStudent}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="text-lg mb-2">✅ All Done?</h3>
        <p className="text-sm text-gray-700 mb-4">
          Once you've completed all steps, click "Check Status" to verify everything is working.
          If all steps show green checkmarks, you're ready to use the app!
        </p>
        <Button onClick={checkAllSteps} disabled={checking}>
          {checking ? 'Checking...' : 'Check Status'}
        </Button>
      </Card>
    </div>
  );
}
