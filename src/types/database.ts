export type permission_type = 'super_admin' | 'admin' | 'manager' | 'agent';
export type department_type = 'sales' | 'marketing' | 'support' | 'engineering' | 'other';
export type shift_type = 'morning' | 'afternoon' | 'evening' | 'night';
export type ticket_status_type = 'fresh' | 'in_progress' | 'closed';
export type ticket_priority_type = 'low' | 'medium' | 'high' | 'critical';
export type ticket_category_type = 'general' | 'billing' | 'technical' | 'feedback' | 'account' | 'feature_request' | 'other';
export type article_status_type = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
export type article_category_type = 'general' | 'product' | 'service' | 'troubleshooting' | 'faq' | 'policy' | 'other';
export type approval_status_type = 'pending' | 'approved' | 'rejected';
export type message_sender_type = 'employee' | 'customer';

export interface Article {
  id: string;
  title: string;
  description: string | null;
  content: string;
  status: article_status_type;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
  is_faq: boolean;
  category: article_category_type;
  slug: string;
  tags: string[];
  article_notes?: ArticleNote[];
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  title: string;
  description: string | null;
  content: string;
  created_at: string;
  created_by: string;
  version_number: number;
  change_summary: string | null;
}

export interface ApprovalRequest {
  id: string;
  article_id: string;
  version_id: string;
  submitted_by: string;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  status: approval_status_type;
  feedback: string | null;
}

export interface ArticleNote {
  id: string;
  article_id: string;
  content: string;
  created_at: string;
  created_by: string;
}

export interface ArticleTag {
  id: string;
  article_id: string;
  tag: string;
} 