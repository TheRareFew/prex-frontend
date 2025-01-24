import React from 'react';
import { CalendarIcon, EyeIcon, TagIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Article, article_status_type } from '../../../types';

interface ArticleCardProps {
  article: Article;
  onSelect: (articleId: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect }) => {
  const statusColors: Record<article_status_type, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      onClick={() => onSelect(article.id)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {article.title}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[article.status]
          }`}
        >
          {article.status.replace('_', ' ')}
        </span>
      </div>

      {article.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {article.description}
        </p>
      )}

      {article.article_notes && article.article_notes.length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
            Latest Note
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {article.article_notes[article.article_notes.length - 1].content}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 mr-1" />
          {formatDate(article.updated_at)}
        </span>
        <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
          <EyeIcon className="w-4 h-4 mr-1" />
          {article.view_count} views
        </span>
        {article.tags.length > 0 && (
          <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
            <TagIcon className="w-4 h-4 mr-1" />
            {article.tags.slice(0, 2).join(', ')}
            {article.tags.length > 2 && ` +${article.tags.length - 2}`}
          </span>
        )}
        {article.article_notes && article.article_notes.length > 0 && (
          <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
            {article.article_notes.length} note{article.article_notes.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          {article.category}
        </span>
      </div>
    </div>
  );
}; 