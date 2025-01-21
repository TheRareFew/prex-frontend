import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type UserRole = 'admin' | 'agent' | 'user';

interface UserData {
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
}

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserData(data as UserData);
        setRole(data.role as UserRole);
        setError(null);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user role');
        setRole(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return {
    role,
    userData,
    loading,
    error,
    isAdmin: role === 'admin',
    isAgent: role === 'agent',
    isUser: role === 'user',
  };
} 