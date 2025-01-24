import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EmployeeMetrics {
  employee_id: string;
  full_name: string | null;
  department: string | null;
  total_tickets_assigned: number;
  total_tickets_resolved: number;
  current_open_tickets: number;
  avg_resolution_time: string | null;
  tickets_by_priority: Record<string, number>;
  tickets_by_category: Record<string, number>;
  avg_first_response_time: string | null;
  total_messages_sent: number;
  avg_messages_per_ticket: number;
  total_articles_created: number;
  total_articles_published: number;
  article_approval_rate: number;
  total_article_views: number;
  articles_by_category: Record<string, number>;
  monthly_tickets_resolved: number;
  monthly_response_rate: number;
}

export const useEmployeeMetrics = (employeeId?: string) => {
  const [metrics, setMetrics] = useState<EmployeeMetrics[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<EmployeeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('employee_performance_metrics')
        .select('*');

      if (supabaseError) throw supabaseError;

      const formattedMetrics = data?.map(metric => ({
        ...metric,
        tickets_by_priority: metric.tickets_by_priority || {},
        tickets_by_category: metric.tickets_by_category || {},
        articles_by_category: metric.articles_by_category || {}
      })) || [];

      setMetrics(formattedMetrics);

      if (employeeId) {
        const selected = formattedMetrics.find(m => m.employee_id === employeeId);
        setSelectedMetrics(selected || null);
      } else {
        setSelectedMetrics(null);
      }

      return formattedMetrics;
    } catch (err) {
      console.error('Error fetching employee metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employee metrics');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [employeeId]);

  // Set up real-time subscription for metrics updates
  useEffect(() => {
    console.log('Setting up employee metrics subscription');

    const channel = supabase.channel('employee_metrics');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_performance_metrics'
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe((status) => {
        console.log('Employee metrics subscription status:', status);
      });

    return () => {
      console.log('Cleaning up employee metrics subscription');
      supabase.removeChannel(channel);
    };
  }, [employeeId]);

  return {
    metrics,
    selectedMetrics,
    loading,
    error,
    fetchMetrics
  };
}; 