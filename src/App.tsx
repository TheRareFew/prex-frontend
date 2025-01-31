import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { ResetPassword } from './components/auth/ResetPassword';
import { UpdatePassword } from './components/auth/UpdatePassword';
import { InviteUser } from './components/auth/InviteUser';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CustomerView } from './components/features/CustomerView';
import { TicketProcessing } from './components/features/TicketProcessing';
import { TicketManagement } from './components/features/TicketManagement';
import { KnowledgeBaseEmployee } from './components/features/KnowledgeBaseEmployee';
import { KnowledgeBaseManager } from './components/features/KnowledgeBaseManager';
import { EmployeeOverview } from './components/features/EmployeeOverview';
import { AnalyticsDashboard } from './components/features/AnalyticsDashboard';
import { AgentChat } from './components/features/AgentChat';
import { useAuth } from './context/AuthContext';
import './styles/App.css';
import { supabase } from './lib/supabase';

function AuthCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  React.useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const source = searchParams.get('source');
        
        console.log('Auth callback triggered with params:', { type, hasTokenHash: !!token_hash, source });

        // If we have an active session and this isn't a verification callback, go to dashboard
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // If this is a verification callback and we have a session, create the employee record
          if (source === 'verification') {
            console.log('Creating employee record for verified user:', session.user.id);
            const { data: employeeData, error: employeeError } = await supabase
              .from('employees')
              .insert([
                {
                  id: session.user.id,
                  permissions: 'manager',
                  department: 'other',
                  shift: 'morning'
                },
              ])
              .select()
              .single();

            if (employeeError) {
              console.error('Error creating employee record:', employeeError);
              setError('Failed to create employee record. Please contact support.');
              setIsProcessing(false);
              return;
            }

            console.log('Employee record created successfully:', employeeData);
            
            // Reload the session to ensure we have the latest data
            await supabase.auth.refreshSession();
          }
          
          navigate('/dashboard', { replace: true });
          return;
        }

        // Handle email verification
        if (token_hash && type === 'signup') {
          console.log('Attempting to verify signup...');
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });

          console.log('Signup verification result:', { success: !error, user: data?.user });

          if (!error && data?.user) {
            console.log('Signup verification successful, creating employee record...');
            // Create employee record after successful verification
            const { data: employeeData, error: employeeError } = await supabase
              .from('employees')
              .insert([
                {
                  id: data.user.id,
                  permissions: 'manager',
                  department: 'other',
                  shift: 'morning'
                },
              ])
              .select()
              .single();

            if (employeeError) {
              console.error('Error creating employee record:', employeeError);
              setError('Failed to create employee record. Please contact support.');
              setIsProcessing(false);
              return;
            }

            console.log('Employee record created successfully:', employeeData);
            
            // Reload the session to ensure we have the latest data
            await supabase.auth.refreshSession();
            
            navigate('/dashboard', { replace: true });
            return;
          }

          if (error) {
            console.error('Error verifying signup:', error);
            setError('Failed to verify email. Please try again.');
            setIsProcessing(false);
            return;
          }
        }

        // If we get here and it was a verification attempt, show error
        if (source === 'verification') {
          setError('Verification failed. Please check your email and try the link again.');
        } else {
          setError('No verification token found. Please check your email for the verification link.');
        }
        setIsProcessing(false);
      } catch (error) {
        console.error('Error in email confirmation:', error);
        setError('An error occurred during verification. Please try again.');
        setIsProcessing(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  // Only redirect to signin if we're not processing and have no user
  React.useEffect(() => {
    if (!isProcessing && !user) {
      navigate('/signin', { replace: true });
    }
  }, [user, navigate, isProcessing]);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        {isProcessing ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying your email...</h2>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          </>
        ) : error ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              to="/signin"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Return to Sign In
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { isManager } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isManager) {
      navigate('/dashboard/customer');
    }
  }, [isManager, navigate]);

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard/customer');
    }
  }, [userRole, navigate]);

  return <>{children}</>;
}

function AppRoutes() {
  const { user, userRole } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/dashboard/customer" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard/customer" replace />} />
      <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard/customer" replace />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      
      {/* Auth callback routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset-callback" element={<Navigate to="/update-password" replace />} />
      
      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Common routes */}
        <Route path="customer" element={<CustomerView />} />

        {/* Employee section */}
        <Route path="employee" element={<Navigate to="/dashboard/ticket-processing" replace />} />
        <Route 
          path="ticket-processing" 
          element={
            <ProtectedRoute requiredRole={['employee', 'agent', 'manager', 'admin', 'super_admin']}>
              <TicketProcessing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="knowledge-base-employee" 
          element={
            <ProtectedRoute requiredRole={['employee', 'agent', 'manager', 'admin', 'super_admin']}>
              <KnowledgeBaseEmployee />
            </ProtectedRoute>
          } 
        />

        {/* Manager section */}
        <Route path="manager" element={<Navigate to="/dashboard/ticket-management" replace />} />
        <Route 
          path="ticket-management" 
          element={
            <ProtectedRoute requiredRole={['manager', 'admin', 'super_admin']}>
              <TicketManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="knowledge-base-manager" 
          element={
            <ProtectedRoute requiredRole={['manager', 'admin', 'super_admin']}>
              <KnowledgeBaseManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="employee-overview" 
          element={
            <ProtectedRoute requiredRole={['manager', 'admin', 'super_admin']}>
              <EmployeeOverview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute requiredRole={['admin', 'super_admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="agent-chat" 
          element={
            <ProtectedRoute requiredRole={['manager', 'admin', 'super_admin']}>
              <AgentChat />
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route path="" element={<Navigate to="/dashboard/customer" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard/customer" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
