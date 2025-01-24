import { Article } from '../../../types';

export type ArticleTab = 'drafts' | 'pending' | 'published' | 'rejected';

export type SortField = 'title' | 'category' | 'status' | 'updated_at';
export type SortDirection = 'asc' | 'desc';

export interface ArticleListProps {
  onArticleSelect: (articleId: string) => void;
  onCreateNew: () => void;
}

export interface ArticleCardProps {
  article: Article;
  onSelect: (articleId: string) => void;
}

export type { Article }; 