import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { ResetPassword } from './components/auth/ResetPassword';
import { UpdatePassword } from './components/auth/UpdatePassword';
import { InviteUser } from './components/auth/InviteUser';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { EmployeeDashboard } from './components/features/EmployeeDashboard';
import { CustomerDashboard } from './components/features/CustomerDashboard';
import { useAuth } from './context/AuthContext';
import './styles/App.css';
import { supabase } from './lib/supabase';

function AuthCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  
  React.useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        console.log('Auth callback params:', { type, hasTokenHash: !!token_hash });

        if (token_hash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });

          console.log('Verify result:', { success: !error, user: data?.user });

          if (!error && data?.user) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // If no token_hash, check if we have an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // If we get here, either there were no tokens or verification failed
        setIsProcessing(false);
      } catch (error) {
        console.error('Error in email confirmation:', error);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying your email...</h2>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

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
        <Route path="employee" element={<EmployeeDashboard />} />
        <Route path="customer" element={<CustomerDashboard />} />
        <Route index element={<Navigate to="customer" replace />} />
      </Route>
      
      {/* Redirect root to dashboard */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
