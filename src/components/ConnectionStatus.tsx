import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMessage('');
    setDetails(null);

    try {
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a784a06a`;
      
      // Try to hit the health check endpoint
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setDetails(data);
      } else {
        setStatus('error');
        setErrorMessage(`HTTP ${response.status}: ${response.statusText}`);
        
        try {
          const errorData = await response.text();
          setDetails({ error: errorData });
        } catch (e) {
          // Ignore parse errors
        }
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Network error');
      console.error('Connection check failed:', error);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Backend Connection Status</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={status === 'checking'}
          >
            {status === 'checking' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {status === 'checking' && (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Checking connection...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span>Connected successfully!</span>
              <Badge variant="default">Active</Badge>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span>Connection failed</span>
              <Badge variant="destructive">Error</Badge>
            </>
          )}
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
        )}

        {details && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Details:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-2">Configuration:</p>
          <div className="space-y-1 text-xs font-mono bg-gray-50 p-3 rounded">
            <div>
              <strong>Project ID:</strong> {projectId}
            </div>
            <div>
              <strong>Edge Function:</strong> make-server-a784a06a
            </div>
            <div>
              <strong>API Base URL:</strong>{' '}
              <a
                href={`https://${projectId}.supabase.co/functions/v1/make-server-a784a06a/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://{projectId}.supabase.co/functions/v1/make-server-a784a06a/health
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm mb-3">
            <strong>Troubleshooting Tips:</strong>
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-gray-700">
            <li>
              Make sure the edge function is deployed to your Supabase project
            </li>
            <li>
              Check that CORS is enabled for your edge function
            </li>
            <li>
              Verify the edge function name matches: <code className="bg-gray-100 px-1 rounded">make-server-a784a06a</code>
            </li>
            <li>
              Ensure environment variables are set in Supabase (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY)
            </li>
            <li>
              Check the Supabase function logs for deployment errors
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
