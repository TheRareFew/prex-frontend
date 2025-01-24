import { useState, useCallback, useEffect } from 'react';
import { Article, article_status_type } from '../types';
import { articlesService } from '../services/articles';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Filters = {
  status?: article_status_type[];
  search?: string;
  category?: string;
  is_faq?: boolean;
};

interface UseArticlesOptions {
  initialFilters?: Filters;
}

interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: Error | null;
  filters: Filters;
  updateFilters: (newFilters: Partial<Filters>) => void;
  fetchArticles: () => Promise<void>;
  fetchArticleById: (id: string) => Promise<Article>;
  createArticle: (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<Article>;
  updateArticle: (id: string, articleData: Partial<Article>) => Promise<Article>;
  submitForApproval: (id: string) => Promise<void>;
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<Filters>(options.initialFilters || {});

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('articles')
        .select(`
          *,
          article_tags (
            tag
          ),
          article_notes (
            id,
            content,
            created_at
          )
        `)
        .order('view_count', { ascending: false });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      } else {
        // By default, only show approved articles for customers
        query = query.eq('status', 'approved');
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.is_faq !== undefined) {
        query = query.eq('is_faq', filters.is_faq);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data: articlesData, error: articlesError } = await query;

      if (articlesError) throw articlesError;

      // Transform the data to match our Article type
      const transformedArticles: Article[] = articlesData.map((article: any) => ({
        ...article,
        tags: article.article_tags?.map((tag: any) => tag.tag) || [],
      }));

      setArticles(transformedArticles);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const incrementViewCount = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.rpc('increment_article_view_count', { article_id: id });
      if (error) throw error;
    } catch (err) {
      console.error('Error incrementing view count:', err);
      // Don't throw the error as view count is not critical
    }
  }, []);

  const fetchArticleById = useCallback(async (id: string): Promise<Article> => {
    try {
      // Increment view count first
      await incrementViewCount(id);

      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select(`
          *,
          article_tags (
            tag
          )
        `)
        .eq('id', id)
        .single();

      if (articleError) throw articleError;

      // Transform the data to match our Article type
      const transformedArticle: Article = {
        ...article,
        tags: article.article_tags?.map((tag: any) => tag.tag) || [],
      };

      return transformedArticle;
    } catch (err) {
      console.error('Error fetching article by ID:', err);
      throw err;
    }
  }, [incrementViewCount]);

  const createArticle = useCallback(async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      setLoading(true);
      setError(null);
      const newArticle = await articlesService.createArticle(articleData);
      setArticles((prev) => [newArticle, ...prev]);
      return newArticle;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateArticle = useCallback(async (id: string, articleData: Partial<Article>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedArticle = await articlesService.updateArticle(id, articleData);
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? updatedArticle : article
        )
      );
      return updatedArticle;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitForApproval = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User must be logged in to submit articles for approval');
      }

      // First, get the latest version number for this article
      const { data: versions, error: versionsError } = await supabase
        .from('article_versions')
        .select('version_number')
        .eq('article_id', id)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionsError) throw versionsError;

      // Get the current article data
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (articleError) throw articleError;

      const nextVersionNumber = versions && versions.length > 0 
        ? versions[0].version_number + 1 
        : 1;

      // Create new version
      const { data: newVersion, error: versionError } = await supabase
        .from('article_versions')
        .insert({
          article_id: id,
          title: article.title,
          description: article.description,
          content: article.content,
          version_number: nextVersionNumber,
          created_by: user.id,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update article status
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'pending_approval' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Create approval request
      const { error: approvalError } = await supabase
        .from('approval_requests')
        .insert({
          article_id: id,
          version_id: newVersion.id,
          status: 'pending',
          submitted_by: user.id,
        });

      if (approvalError) throw approvalError;

      // Update local state
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id
            ? { ...article, status: 'pending_approval' as article_status_type }
            : article
        )
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch articles on mount and when filters change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    filters,
    updateFilters,
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    submitForApproval,
  };
} 