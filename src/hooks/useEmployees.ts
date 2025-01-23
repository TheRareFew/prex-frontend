import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Employee {
  id: string;
  full_name: string;
  department: string;
  permissions: string;
  unresolved_tickets: number;
}

interface EmployeeProfile {
  id: string;
  full_name: string;
  department: string;
  permissions: string;
}

export const useEmployees = (department?: string) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all employees (optionally filtered by department)
      let { data: employeesData, error: employeesError } = await supabase
        .from('employee_profiles')
        .select('id, full_name, department, permissions');

      if (department && employeesData) {
        employeesData = employeesData.filter(emp => emp.department === department);
      }

      if (employeesError) throw employeesError;

      // Then, for each employee, count their unresolved tickets
      const employeesWithTickets = await Promise.all(
        (employeesData || []).map(async (employee: EmployeeProfile) => {
          const { count, error: ticketError } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', employee.id)
            .eq('resolved', false);

          if (ticketError) throw ticketError;

          return {
            ...employee,
            unresolved_tickets: count || 0,
          };
        })
      );

      // Sort employees by number of unresolved tickets (ascending)
      const sortedEmployees = employeesWithTickets.sort(
        (a: Employee, b: Employee) => a.unresolved_tickets - b.unresolved_tickets
      );

      setEmployees(sortedEmployees);
      return sortedEmployees;
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedEmployee = (ticketCategory: string): Employee | null => {
    if (employees.length === 0) return null;

    // First, try to find employees in the same department as the ticket category
    const departmentEmployees = employees.filter(
      (emp) => emp.department.toLowerCase() === ticketCategory.toLowerCase()
    );

    if (departmentEmployees.length > 0) {
      // Return the employee with the least unresolved tickets
      return departmentEmployees.reduce((prev, current) =>
        prev.unresolved_tickets <= current.unresolved_tickets ? prev : current
      );
    }

    // If no matching department, return the employee with the least tickets overall
    return employees[0]; // Already sorted by unresolved_tickets
  };

  // Set up real-time subscription for ticket assignments
  useEffect(() => {
    console.log('Setting up employee ticket subscription');

    const channel = supabase.channel('employee_tickets');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: 'resolved=eq.false',
        },
        () => {
          // Refetch employees data when tickets change
          fetchEmployees();
        }
      )
      .subscribe((status) => {
        console.log('Employee ticket subscription status:', status);
      });

    return () => {
      console.log('Cleaning up employee ticket subscription');
      supabase.removeChannel(channel);
    };
  }, [department]);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [department]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    getRecommendedEmployee,
  };
}; 