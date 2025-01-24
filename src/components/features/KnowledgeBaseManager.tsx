import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PendingArticlesList } from './ArticleList/PendingArticlesList';
import { ArticlePreview } from './ArticlePreview/ArticlePreview';
import { useArticles } from '../../hooks/useArticles';
import { useArticleReview } from '../../hooks/useArticleReview';
import { Article } from './ArticleList/types';

type ViewState = 'list' | 'preview';

export const KnowledgeBaseManager: React.FC = () => {
  const { isManager } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { fetchArticleById } = useArticles();
  const { approveArticle, rejectArticle, loading: reviewLoading } = useArticleReview();

  if (!isManager) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        Access denied. Manager privileges required.
      </div>
    );
  }

  const handleArticleSelect = async (articleId: string) => {
    try {
      setIsLoading(true);
      const article = await fetchArticleById(articleId);
      setSelectedArticle(article);
      setSelectedArticleId(articleId);
      setCurrentView('preview');
    } catch (err) {
      setError('Failed to load article details');
      console.error('Error loading article:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (articleId: string, feedback?: string) => {
    try {
      setIsLoading(true);
      await approveArticle(articleId, feedback);
      setCurrentView('list');
      setSelectedArticle(null);
      setSelectedArticleId(null);
    } catch (err) {
      setError('Failed to approve article');
      console.error('Error approving article:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (articleId: string, feedback: string) => {
    try {
      setIsLoading(true);
      await rejectArticle(articleId, feedback);
      setCurrentView('list');
      setSelectedArticle(null);
      setSelectedArticleId(null);
    } catch (err) {
      setError('Failed to reject article');
      console.error('Error rejecting article:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Knowledge Base Manager
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Review and manage knowledge base articles pending approval
            </p>
          </div>
          {currentView === 'preview' && (
            <button
              onClick={() => {
                setCurrentView('list');
                setSelectedArticle(null);
                setSelectedArticleId(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to List
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        {/* Loading State */}
        {(isLoading || reviewLoading) && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !reviewLoading && !error && (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow">
            {currentView === 'list' ? (
              <div className="p-6">
                <PendingArticlesList onArticleSelect={handleArticleSelect} />
              </div>
            ) : (
              <div className="p-6">
                {selectedArticle ? (
                  <ArticlePreview
                    article={selectedArticle}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    Article not found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 