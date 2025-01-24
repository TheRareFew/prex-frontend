import { Article } from '../ArticleList/types';
import { article_category_type } from '../../../types/database';

export interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Partial<Article>) => void;
  onSubmitForApproval: (article: Partial<Article>) => void;
  onCancel: () => void;
}

export interface ArticleFormData {
  title: string;
  description: string;
  content: string;
  category: article_category_type;
  is_faq: boolean;
  tags: string[];
} 