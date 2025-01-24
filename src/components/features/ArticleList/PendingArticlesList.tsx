import React, { useEffect, useState } from 'react';
import { Article } from '../../../types';
import { ArticleCard } from './ArticleCard';
import { useArticles } from '../../../hooks/useArticles';

interface PendingArticlesListProps {
  onArticleSelect: (articleId: string) => void;
}

export const PendingArticlesList: React.FC<PendingArticlesListProps> = ({
  onArticleSelect,
}) => {
  const { articles: fetchedArticles, error, loading } = useArticles({
    initialFilters: {
      status: ['pending_approval']
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-gray-100 dark:bg-gray-700 h-32 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4">
        Error loading articles: {error.message}
      </div>
    );
  }

  if (!fetchedArticles || fetchedArticles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No articles pending approval
      </div>
    );
  }

  // Sort articles by created_at date (oldest first)
  const sortedArticles = [...fetchedArticles].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedArticles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onSelect={onArticleSelect}
        />
      ))}
    </div>
  );
}; 