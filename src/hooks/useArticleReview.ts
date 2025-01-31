import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Article } from '../components/features/ArticleList/types';
import { useAuth } from '../context/AuthContext';

interface UseArticleReviewReturn {
  approveArticle: (articleId: string, feedback?: string) => Promise<void>;
  rejectArticle: (articleId: string, feedback: string) => Promise<void>;
  addArticleNote: (articleId: string, note: string) => Promise<void>;
  error: Error | null;
  loading: boolean;
}

export function useArticleReview(): UseArticleReviewReturn {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const approveArticle = async (articleId: string, feedback?: string) => {
    try {
      if (!user) throw new Error('User must be logged in to approve articles');
      setLoading(true);
      setError(null);

      // Start a transaction
      const { data: article, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (fetchError) throw fetchError;

      // Update article status
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'approved' })
        .eq('id', articleId);

      if (updateError) throw updateError;

      // Create approval request entry
      const { error: approvalError } = await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          feedback: feedback || null,
        })
        .eq('article_id', articleId)
        .eq('status', 'pending');

      if (approvalError) throw approvalError;

      // Add note if feedback is provided
      if (feedback) {
        const { error: noteError } = await supabase
          .from('article_notes')
          .insert({
            article_id: articleId,
            content: feedback,
            created_by: user.id,
          });

        if (noteError) throw noteError;
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectArticle = async (articleId: string, feedback: string) => {
    try {
      if (!user) throw new Error('User must be logged in to reject articles');
      setLoading(true);
      setError(null);

      // Update article status
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'rejected' })
        .eq('id', articleId);

      if (updateError) throw updateError;

      // Update approval request
      const { error: approvalError } = await supabase
        .from('approval_requests')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          feedback,
        })
        .eq('article_id', articleId)
        .eq('status', 'pending');

      if (approvalError) throw approvalError;

      // Add rejection note
      const { error: noteError } = await supabase
        .from('article_notes')
        .insert({
          article_id: articleId,
          content: feedback,
          created_by: user.id,
        });

      if (noteError) throw noteError;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addArticleNote = async (articleId: string, note: string) => {
    try {
      if (!user) throw new Error('User must be logged in to add article notes');
      setLoading(true);
      setError(null);

      const { error: noteError } = await supabase
        .from('article_notes')
        .insert({
          article_id: articleId,
          content: note,
          created_by: user.id,
        });

      if (noteError) throw noteError;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    approveArticle,
    rejectArticle,
    addArticleNote,
    error,
    loading,
  };
} 