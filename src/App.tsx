import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SetupWizard } from './components/SetupWizard';
import { DiagnosticTool } from './components/DiagnosticTool';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabase-client';
import { Button } from './components/ui/button';
import { projectId } from './utils/supabase/info';
import { FullNoteEditor } from './components/notes/FullNoteEditor';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendAndSession();
  }, []);

  const checkBackendAndSession = async () => {
    // First check if backend is ready
    try {
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a784a06a`;
      const { publicAnonKey } = await import('./utils/supabase/info');
      const response = await fetch(`${API_BASE}/health`, { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      setBackendReady(response.ok);
      
      if (!response.ok) {
        setShowSetupWizard(true);
      }
    } catch (error) {
      setBackendReady(false);
      setShowSetupWizard(true);
    }
    
    // Then check session
    checkSession();
  };

  const checkSession = async () => {
    try {
      // Check if user is already signed in with Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setLoading(false);
        return;
      }
      
      if (session?.access_token) {
        console.log('✅ Found existing session, restoring...');
        
        // Verify the token is still valid by refreshing it
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear invalid session
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        if (refreshData.session) {
          const role = refreshData.session.user.user_metadata?.role || 'student';
          console.log('✅ Session restored! Role:', role);
          setAccessToken(refreshData.session.access_token);
          setUserRole(role);
        }
      }
    } catch (error) {
      console.error('Session restoration error:', error);
    }
    
    setLoading(false);
  };

  const handleAuthSuccess = async (role: string) => {
    try {
      // Use predefined credentials for Mauro and Xindy
      const credentials = {
        teacher: { email: 'creator@dutch.app', password: 'creator-secure-2024-dutch' },
        student: { email: 'learner@dutch.app', password: 'learner-secure-2024-dutch' }
      };

      const creds = credentials[role as 'teacher' | 'student'];
      
      console.log('Attempting sign in with:', creds.email);
      
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });

      if (error) {
        console.error('Sign in error details:', error);
        
        // Provide helpful error messages with option to open dashboard
        const dashboardUrl = 'https://supabase.com/dashboard/project/tnlceozwrkspncxwcaqe/auth/users';
        
        if (error.message.includes('Email not confirmed')) {
          const shouldOpen = confirm(
            '⚠️ Account Not Confirmed\n\n' +
            `The ${role === 'teacher' ? 'creator' : 'learner'} account exists but needs to be confirmed.\n\n` +
            '1. Go to Supabase Dashboard → Authentication → Users\n' +
            `2. Find ${creds.email}\n` +
            '3. Click the three dots → "Confirm Email"\n\n' +
            'Click OK to open the dashboard now.'
          );
          if (shouldOpen) window.open(dashboardUrl, '_blank');
        } else if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
          const shouldOpen = confirm(
            '⚠️ Account Not Found or Wrong Password\n\n' +
            `Cannot sign in with ${creds.email}\n\n` +
            'Options:\n' +
            '1. Check if user exists in Supabase Dashboard\n' +
            '2. Reset the password if it exists\n' +
            '3. Create the user if it doesn\'t exist\n\n' +
            `Required credentials:\n` +
            `Email: ${creds.email}\n` +
            `Password: ${creds.password}\n` +
            '✅ Auto Confirm User: MUST be enabled\n\n' +
            'Click OK to open the dashboard now.'
          );
          if (shouldOpen) window.open(dashboardUrl, '_blank');
        } else {
          alert(`Sign in failed: ${error.message}\n\nCheck the console for details.`);
        }
        return;
      }

      if (data.session?.access_token) {
        console.log('Sign in successful! Access token received.');
        setAccessToken(data.session.access_token);
        setUserRole(role as 'teacher' | 'student');
      } else {
        console.error('No access token received despite no error');
        alert('Sign in failed: No access token received');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      alert(`Authentication failed: ${err.message || 'Unknown error'}\n\nCheck the console for details.`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        </div>
      </div>
    );
  }

  // Show setup wizard if backend is not ready
  if (showSetupWizard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 p-8">
        <div className="mb-4 flex items-center justify-between">
          {backendReady === false ? (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 text-sm">
              ⚠️ Backend not responding - Running diagnostics...
            </div>
          ) : (
            <Button onClick={() => setShowSetupWizard(false)} variant="outline">
              ← Back to App
            </Button>
          )}
          <Button
            onClick={() => setShowConnectionStatus(true)}
            variant="outline"
            size="sm"
          >
            🔧 Connection Details
          </Button>
        </div>
        <DiagnosticTool />
      </div>
    );
  }

  // Show connection status if requested
  if (showConnectionStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 p-8">
        <div className="mb-4 flex gap-2">
          <Button onClick={() => setShowConnectionStatus(false)} variant="outline">
            ← Back
          </Button>
          <Button onClick={() => {
            setShowConnectionStatus(false);
            setShowSetupWizard(true);
          }} variant="outline">
            📋 Setup Guide
          </Button>
        </div>
        <ConnectionStatus />
      </div>
    );
  }

  if (!accessToken || !userRole) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button
            onClick={() => setShowSetupWizard(true)}
            variant="outline"
            size="sm"
          >
            📋 Setup Guide
          </Button>
          <Button
            onClick={() => setShowConnectionStatus(true)}
            variant="outline"
            size="sm"
          >
            🔧 Check Connection
          </Button>
        </div>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/*" element={<TeacherDashboard accessToken={accessToken} onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Toaster />
      <StudentDashboard accessToken={accessToken} onLogout={handleLogout} />
    </BrowserRouter>
  );
}