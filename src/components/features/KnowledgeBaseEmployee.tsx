import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ArticleList } from './ArticleList';
import { ArticleEditor } from './ArticleEditor';
import { Article } from './ArticleList/types';
import { useArticles } from '../../hooks/useArticles';

type ArticleView = 'list' | 'editor' | 'preview';

export const KnowledgeBaseEmployee: React.FC = () => {
  const [currentView, setCurrentView] = useState<ArticleView>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>(undefined);

  const {
    fetchArticleById,
    createArticle,
    updateArticle,
    submitForApproval,
    updateFilters,
    error: apiError,
  } = useArticles();

  useEffect(() => {
    if (searchQuery) {
      updateFilters({ search: searchQuery });
    }
  }, [searchQuery, updateFilters]);

  const handleCreateNewArticle = () => {
    setCurrentView('editor');
    setSelectedArticleId(null);
    setSelectedArticle(undefined);
  };

  const handleArticleSelect = async (articleId: string) => {
    try {
      setSelectedArticleId(articleId);
      const article = await fetchArticleById(articleId);
      setSelectedArticle(article);
      setCurrentView('editor');
    } catch (error) {
      console.error('Error fetching article:', error);
      // TODO: Show error notification
    }
  };

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    try {
      if (selectedArticleId) {
        await updateArticle(selectedArticleId, articleData);
      } else {
        await createArticle(articleData as Omit<Article, 'id' | 'created_at' | 'updated_at' | 'created_by'>);
      }
      setCurrentView('list');
    } catch (error) {
      console.error('Error saving article:', error);
      // TODO: Show error notification
    }
  };

  const handleSubmitForApproval = async (articleData: Partial<Article>) => {
    try {
      if (selectedArticleId) {
        await updateArticle(selectedArticleId, articleData);
        await submitForApproval(selectedArticleId);
      } else {
        const newArticle = await createArticle(
          articleData as Omit<Article, 'id' | 'created_at' | 'updated_at' | 'created_by'>
        );
        await submitForApproval(newArticle.id);
      }
      setCurrentView('list');
    } catch (error) {
      console.error('Error submitting article for approval:', error);
      // TODO: Show error notification
    }
  };

  const handleCancelEdit = () => {
    setCurrentView('list');
    setSelectedArticleId(null);
    setSelectedArticle(undefined);
  };

  if (apiError) {
    // TODO: Show error notification instead of error text
    console.error('API Error:', apiError);
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center px-4 py-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold">
            Knowledge Base
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create and manage knowledge base articles
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {currentView === 'list' && (
            <button
              onClick={handleCreateNewArticle}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <PlusIcon className="w-4 h-4 mr-1.5" />
              Create New Article
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'list' && (
          <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="max-w-2xl">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Article List Container */}
            <div className="flex-1 overflow-hidden">
              <ArticleList
                onArticleSelect={handleArticleSelect}
                onCreateNew={handleCreateNewArticle}
              />
            </div>
          </div>
        )}

        {currentView === 'editor' && (
          <div className="h-full overflow-auto p-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
              <ArticleEditor
                article={selectedArticle}
                onSave={handleSaveArticle}
                onSubmitForApproval={handleSubmitForApproval}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}

        {currentView === 'preview' && (
          <div className="h-full overflow-auto p-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Article preview will be implemented here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 