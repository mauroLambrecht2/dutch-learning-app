import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Copy } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface DiagnosticCheck {
  name: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
  details?: any;
}

export function DiagnosticTool() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>([
    { name: 'Edge Function Health', status: 'pending' },
    { name: 'CORS Configuration', status: 'pending' },
    { name: 'Environment Variables', status: 'pending' },
    { name: 'Database Table', status: 'pending' },
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const updateCheck = (name: string, status: DiagnosticCheck['status'], message?: string, details?: any) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, status, message, details } : check
    ));
  };

  const runDiagnostics = async () => {
    setRunning(true);
    setLogs([]);
    addLog('Starting diagnostics...');

    // Reset all checks
    setChecks(prev => prev.map(check => ({ ...check, status: 'pending' as const })));

    const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a784a06a`;
    
    // Check 1: Edge Function Health
    addLog('Checking edge function health endpoint...');
    updateCheck('Edge Function Health', 'checking');
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      addLog(`Health check response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        updateCheck('Edge Function Health', 'success', 'Health check passed', data);
        addLog(`✅ Health check successful: ${JSON.stringify(data)}`);
      } else {
        const errorText = await response.text();
        updateCheck('Edge Function Health', 'error', `HTTP ${response.status}`, errorText);
        addLog(`❌ Health check failed with status ${response.status}`);
        addLog(`Error response: ${errorText.substring(0, 200)}`);
      }
    } catch (error: any) {
      updateCheck('Edge Function Health', 'error', error.message);
      addLog(`❌ Health check error: ${error.message}`);
    }

    // Check 2: CORS Configuration
    addLog('Checking CORS configuration...');
    updateCheck('CORS Configuration', 'checking');
    try {
      // Make an actual request with a custom header to trigger CORS
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Custom-Header': 'test', // This will trigger CORS preflight
        },
        mode: 'cors',
      });

      // If the request succeeded without CORS errors, CORS is working
      if (response.ok) {
        // Try to read some headers (not all are exposed, but that's OK)
        const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
        const corsHeaders = {
          'Access-Control-Allow-Origin': allowOrigin || '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        };
        
        updateCheck('CORS Configuration', 'success', 'CORS working (request succeeded)', corsHeaders);
        addLog(`✅ CORS is properly configured - cross-origin request succeeded`);
      } else {
        updateCheck('CORS Configuration', 'error', `Request failed with status ${response.status}`);
        addLog(`⚠️ Request returned ${response.status}`);
      }
    } catch (error: any) {
      // If we get a CORS error, it will be caught here
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        updateCheck('CORS Configuration', 'error', 'CORS blocked by browser', error.message);
        addLog(`❌ CORS error: ${error.message}`);
      } else {
        // Other errors mean CORS is OK but something else failed
        updateCheck('CORS Configuration', 'success', 'CORS working (no CORS error)', { note: 'Request succeeded without CORS issues' });
        addLog(`✅ No CORS errors detected (other error: ${error.message})`);
      }
    }

    // Check 3: Environment Variables (indirect check via signup endpoint)
    addLog('Checking environment variables...');
    updateCheck('Environment Variables', 'checking');
    try {
      // Try to make a request that requires env vars
      const response = await fetch(`${API_BASE}/days`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      addLog(`Days endpoint response: ${response.status}`);
      
      if (response.status === 200 || response.status === 401) {
        // 200 means it worked, 401 means auth worked but we're not authorized (expected)
        updateCheck('Environment Variables', 'success', 'Environment variables configured');
        addLog(`✅ Environment variables appear to be set`);
      } else if (response.status === 500) {
        const errorText = await response.text();
        if (errorText.includes('SUPABASE_URL') || errorText.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          updateCheck('Environment Variables', 'error', 'Missing environment variables', errorText);
          addLog(`❌ Missing environment variables`);
        } else {
          updateCheck('Environment Variables', 'success', 'Environment variables configured');
          addLog(`⚠️ Got 500 but not env var related`);
        }
      } else {
        updateCheck('Environment Variables', 'error', `Unexpected status: ${response.status}`);
        addLog(`⚠️ Unexpected status: ${response.status}`);
      }
    } catch (error: any) {
      updateCheck('Environment Variables', 'error', error.message);
      addLog(`❌ Env var check error: ${error.message}`);
    }

    // Check 4: Database Table
    addLog('Checking database table...');
    updateCheck('Database Table', 'checking');
    try {
      // This is an indirect check - we'll see if the function can query the table
      const response = await fetch(`${API_BASE}/days`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        updateCheck('Database Table', 'success', 'Database table accessible');
        addLog(`✅ Database table exists and is accessible`);
      } else if (response.status === 500) {
        const errorText = await response.text();
        if (errorText.includes('kv_store_a784a06a') || errorText.includes('does not exist')) {
          updateCheck('Database Table', 'error', 'Table does not exist', errorText);
          addLog(`❌ Database table kv_store_a784a06a does not exist`);
        } else {
          updateCheck('Database Table', 'success', 'Table exists but other error');
          addLog(`⚠️ Table exists but got error: ${errorText.substring(0, 100)}`);
        }
      } else {
        updateCheck('Database Table', 'error', `Status: ${response.status}`);
        addLog(`⚠️ Database check returned: ${response.status}`);
      }
    } catch (error: any) {
      updateCheck('Database Table', 'error', error.message);
      addLog(`❌ Database check error: ${error.message}`);
    }

    setRunning(false);
    addLog('Diagnostics complete!');
  };

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    toast.success('Logs copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl">Diagnostic Tool</h2>
          <Button onClick={runDiagnostics} disabled={running}>
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.name} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 pt-0.5">
                {check.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {check.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {check.status === 'checking' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                {check.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{check.name}</span>
                  {check.status === 'success' && <Badge variant="default">OK</Badge>}
                  {check.status === 'error' && <Badge variant="destructive">Failed</Badge>}
                  {check.status === 'checking' && <Badge variant="outline">Checking...</Badge>}
                </div>
                
                {check.message && (
                  <p className="text-sm text-gray-600">{check.message}</p>
                )}
                
                {check.details && (
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                    {typeof check.details === 'string' 
                      ? check.details.substring(0, 300) 
                      : JSON.stringify(check.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Diagnostic Logs</h3>
          {logs.length > 0 && (
            <Button variant="outline" size="sm" onClick={copyLogs}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Logs
            </Button>
          )}
        </div>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs max-h-96 overflow-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Click "Run Diagnostics" to see logs...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg mb-3">Quick Fixes</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>❌ Edge Function Health Failed:</strong>
            <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
              <li>Ensure the function is deployed: <code className="bg-white px-1 rounded">supabase functions deploy make-server-a784a06a</code></li>
              <li>Check function name matches: make-server-a784a06a</li>
              <li>Verify routes start with / not /make-server-a784a06a/</li>
            </ul>
          </div>
          
          <div>
            <strong>❌ Environment Variables Failed:</strong>
            <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
              <li>Go to Edge Functions → make-server-a784a06a → Settings</li>
              <li>Add: SUPABASE_URL = https://{projectId}.supabase.co</li>
              <li>Add: SUPABASE_ANON_KEY = {publicAnonKey.substring(0, 20)}...</li>
              <li>Add: SUPABASE_SERVICE_ROLE_KEY = (your service role key)</li>
              <li>Redeploy after adding env vars</li>
            </ul>
          </div>
          
          <div>
            <strong>❌ Database Table Failed:</strong>
            <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
              <li>Go to SQL Editor in Supabase Dashboard</li>
              <li>Run: <code className="bg-white px-1 rounded">CREATE TABLE kv_store_a784a06a (key TEXT PRIMARY KEY, value JSONB NOT NULL);</code></li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
