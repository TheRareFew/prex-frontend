import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PostgrestResponse } from '@supabase/supabase-js';

export const useSupabaseQuery = <T extends Record<string, any>>(tableName: string) => {
  const [data, setData] = useState<T | T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOne = async () => {
    setIsLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
        .single();

      if (queryError) throw queryError;
      const typedResult = result as unknown as T;
      setData(typedResult);
      setError(null);
      return typedResult;
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      setData(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMany = async (options?: {
    columns?: string;
    limit?: number;
    filters?: Record<string, any>;
  }) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from(tableName)
        .select(options?.columns || '*');

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: results, error: queryError } = await query;

      if (queryError) throw queryError;
      const typedResults = results as unknown as T[];
      setData(typedResults);
      setError(null);
      return typedResults;
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      setData(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    fetchOne,
    fetchMany,
  };
}; 