import React, { useState, useEffect } from 'react';
import { ArticleListProps, ArticleTab, SortField, SortDirection } from './types';
import { ArticleCard } from './ArticleCard';
import { useArticles } from '../../../hooks/useArticles';
import { article_status_type } from '../../../types/database';

const TABS: { id: ArticleTab; label: string; statuses: article_status_type[] }[] = [
  { id: 'drafts', label: 'My Drafts', statuses: ['draft'] },
  { id: 'pending', label: 'Pending Approval', statuses: ['pending_approval'] },
  { id: 'published', label: 'Published', statuses: ['approved'] },
  { id: 'rejected', label: 'Rejected', statuses: ['rejected'] },
];

export const ArticleList: React.FC<ArticleListProps> = ({
  onArticleSelect,
  onCreateNew,
}) => {
  const [activeTab, setActiveTab] = useState<ArticleTab>('drafts');
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { articles, loading, error, updateFilters } = useArticles({
    initialFilters: {
      status: TABS.find((tab) => tab.id === activeTab)?.statuses,
    },
  });

  useEffect(() => {
    updateFilters({
      status: TABS.find((tab) => tab.id === activeTab)?.statuses,
    });
  }, [activeTab, updateFilters]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'title':
        return modifier * a.title.localeCompare(b.title);
      case 'category':
        return modifier * a.category.localeCompare(b.category);
      case 'status':
        return modifier * a.status.localeCompare(b.status);
      case 'updated_at':
        return modifier * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        Error loading articles: {error.message}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="px-4 flex mb-2 flex-shrink-0">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              py-1.5 px-6 text-sm font-medium rounded-md mr-2
              ${
                activeTab === id
                  ? 'bg-blue-600 dark:bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="px-4 flex space-x-3 mb-2 flex-shrink-0">
        {['title', 'category', 'status', 'updated_at'].map((field) => (
          <button
            key={field}
            onClick={() => handleSort(field as SortField)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium
              ${
                sortField === field
                  ? 'bg-blue-600 dark:bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
            {sortField === field && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Article Cards - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 space-y-2 pb-2">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-gray-800 h-20 rounded-lg"
                />
              ))}
            </div>
          ) : sortedArticles.length === 0 && activeTab === 'drafts' ? (
            <div className="text-center py-6">
              <p className="text-gray-400">
                No draft articles found. Create your first article!
              </p>
              <button
                onClick={onCreateNew}
                className="mt-3 px-4 py-1.5 bg-blue-600 dark:bg-purple-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-purple-700 transition-colors"
              >
                Create New Article
              </button>
            </div>
          ) : sortedArticles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400">
                No articles found in this section.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onSelect={onArticleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 