import { supabase } from '../lib/supabase';
import { Article } from '../components/features/ArticleList/types';
import { article_status_type } from '../types/database';

export const articlesService = {
  async checkIsEmployee() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Auth error:', userError);
      throw userError;
    }
    console.log('Current user:', userData.user);

    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, permissions, department')
      .eq('id', userData.user.id)
      .single();

    if (employeeError) {
      console.error('Employee fetch error:', employeeError);
      console.error('Looking for employee with ID:', userData.user.id);
      throw new Error(`User is not an employee: ${employeeError.message}`);
    }

    console.log('Employee data:', employeeData);
    return employeeData;
  },

  async fetchArticles(filters?: {
    status?: article_status_type[];
    search?: string;
    category?: string;
    created_by?: string;
  }) {
    let query = supabase
      .from('articles')
      .select('*, article_tags(tag)')
      .order('updated_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transform the data to match our Article type
    return data.map((article: any) => ({
      ...article,
      tags: article.article_tags?.map((t: any) => t.tag) || [],
    })) as Article[];
  },

  async fetchArticleById(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*, article_tags(tag)')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      tags: data.article_tags?.map((t: any) => t.tag) || [],
    } as Article;
  },

  async createArticle(articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      console.log('Starting article creation...');
      
      // First check if user is an employee
      console.log('Checking if user is employee...');
      const employeeData = await this.checkIsEmployee();
      console.log('Employee data retrieved:', employeeData);

      // Extract tags from article data
      const { tags, ...articleWithoutTags } = articleData;
      
      // Create a unique slug by adding a timestamp
      const timestamp = new Date().getTime();
      const baseSlug = articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uniqueSlug = `${baseSlug}-${timestamp}`;
      
      // Create the insert payload
      const insertPayload = {
        ...articleWithoutTags,
        created_by: employeeData.id,
        slug: uniqueSlug,
      };
      console.log('Preparing to insert article with payload:', insertPayload);

      // Create article
      const { data, error } = await supabase
        .from('articles')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.error('Article creation error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Article created successfully:', data);

      // Insert tags if there are any
      if (tags && tags.length > 0) {
        console.log('Preparing to insert tags:', tags);
        const { error: tagError } = await supabase
          .from('article_tags')
          .insert(
            tags.map((tag) => ({
              article_id: data.id,
              tag,
            }))
          );

        if (tagError) {
          console.error('Tag creation error:', tagError);
          throw tagError;
        }
        console.log('Tags inserted successfully');
      }

      return { ...data, tags: tags || [] } as Article;
    } catch (error) {
      console.error('Complete error trace:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },

  async updateArticle(id: string, articleData: Partial<Article>) {
    // First check if user is an employee
    await this.checkIsEmployee();

    // Extract tags from article data
    const { tags, ...articleWithoutTags } = articleData;

    // Update article
    const { data, error } = await supabase
      .from('articles')
      .update({
        ...articleWithoutTags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update tags if they were provided
    if (tags !== undefined) {
      // Delete existing tags
      await supabase.from('article_tags').delete().eq('article_id', id);

      // Insert new tags if there are any
      if (tags.length > 0) {
        const { error: tagError } = await supabase
          .from('article_tags')
          .insert(
            tags.map((tag) => ({
              article_id: id,
              tag,
            }))
          );

        if (tagError) {
          throw tagError;
        }
      }
    }

    return { ...data, tags: tags || [] } as Article;
  },

  async submitForApproval(id: string) {
    // First check if user is an employee
    const employeeData = await this.checkIsEmployee();

    // Get the current article data
    const article = await this.fetchArticleById(id);

    // Create an article version
    const { data: versionData, error: versionError } = await supabase
      .from('article_versions')
      .insert([
        {
          article_id: id,
          title: article.title,
          description: article.description,
          content: article.content,
          created_by: employeeData.id,
          version_number: 1, // For now, just use 1 as we'll implement proper versioning later
          change_summary: 'Initial version'
        }
      ])
      .select()
      .single();

    if (versionError) {
      console.error('Version creation error:', versionError);
      throw versionError;
    }

    // Create approval request with the version
    const { data, error } = await supabase
      .from('approval_requests')
      .insert([
        {
          article_id: id,
          version_id: versionData.id,
          submitted_by: employeeData.id,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Approval request creation error:', error);
      throw error;
    }

    // Update article status
    await this.updateArticle(id, { status: 'pending_approval' });

    return data;
  },
}; 