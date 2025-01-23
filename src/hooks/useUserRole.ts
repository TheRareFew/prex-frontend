import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'employee' | 'customer';

interface UserData {
  role: UserRole;
  department?: string;
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
        // First try to fetch from employees table
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('permissions, department')
          .eq('id', user.id)
          .single();

        if (!employeeError && employeeData) {
          setUserData({
            role: employeeData.permissions as UserRole,
            department: employeeData.department,
            full_name: user.user_metadata.full_name || '',
            avatar_url: null
          });
          setRole(employeeData.permissions as UserRole);
          setError(null);
          return;
        }

        // If not found in employees, check customers table
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!customerError && customerData) {
          setUserData({
            role: 'customer',
            full_name: user.user_metadata.full_name || '',
            avatar_url: null
          });
          setRole('customer');
          setError(null);
          return;
        }

        throw new Error('User not found in either employees or customers table');
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
    isAdmin: role === 'admin' || role === 'super_admin',
    isManager: role === 'manager',
    isAgent: role === 'agent',
    isEmployee: role === 'employee',
    isCustomer: role === 'customer',
    department: userData?.department
  };
} 