import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; session: Session | null; }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  inviteUser: (email: string) => Promise<void>;
  isEmailVerified: boolean;
  userRole: 'super_admin' | 'admin' | 'manager' | 'agent' | 'customer' | null;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userRole, setUserRole] = useState<AuthContextType['userRole']>(null);

  // Fetch user role from database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('permissions')
        .eq('id', userId)
        .single();

      if (error) {
        // If no employee record found, check customers table
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('id', userId)
          .single();

        if (!customerError && customerData) {
          setUserRole('customer');
          return;
        }
        throw error;
      }

      setUserRole(data.permissions);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsEmailVerified(session?.user?.email_confirmed_at != null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsEmailVerified(session?.user?.email_confirmed_at != null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsEmailVerified(data.user?.email_confirmed_at != null);
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?source=verification`,
        },
      });
      
      if (error) throw error;

      // Check if confirmation email was sent
      if (!data.user?.confirmation_sent_at) {
        console.error('Confirmation email was not sent automatically');
        // Try to send confirmation email manually
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?source=verification`,
          }
        });
        
        if (resendError) {
          console.error('Error sending confirmation email:', resendError);
          throw resendError;
        }
      }

      // Sign out immediately to ensure they verify their email
      await supabase.auth.signOut();
      setIsEmailVerified(false);
      setUser(null);
      
      return data;
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsEmailVerified(false);
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-callback`,
      });
      if (error) throw error;
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  };

  const inviteUser = async (email: string) => {
    try {
      setError(null);
      // Note: This requires admin privileges
      const { error } = await supabase.auth.admin.inviteUserByEmail(email);
      if (error) throw error;
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    inviteUser,
    isEmailVerified,
    userRole,
    isManager: userRole === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 