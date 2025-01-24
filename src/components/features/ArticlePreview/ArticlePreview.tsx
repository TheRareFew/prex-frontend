import React, { useState } from 'react';
import { Article } from '../../../types';
import { RichTextDisplay } from '../../common/RichTextDisplay/RichTextDisplay';

interface ArticlePreviewProps {
  article: Article;
  onApprove: (articleId: string, feedback?: string) => Promise<void>;
  onReject: (articleId: string, feedback: string) => Promise<void>;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  article,
  onApprove,
  onReject,
}) => {
  const [feedback, setFeedback] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async () => {
    await onApprove(article.id, feedback);
  };

  const handleReject = async () => {
    if (!feedback.trim()) return;
    await onReject(article.id, feedback);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-gray-800 rounded-lg">
      {/* Article Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold dark:text-white mb-4">
            {article.title}
          </h1>
          {article.description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {article.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Category: {article.category}</p>
            <p>Created: {new Date(article.created_at).toLocaleString()}</p>
            <p>Last updated: {new Date(article.updated_at).toLocaleString()}</p>
            <p>Views: {article.view_count}</p>
          </div>
        </div>
        <div className="prose dark:prose-invert max-w-none dark:text-white prose-headings:dark:text-white prose-strong:dark:text-white prose-code:dark:text-white">
          <RichTextDisplay content={article.content} />
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="border-t dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
        <div className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add feedback or notes (optional for approval, required for rejection)"
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            rows={3}
          />
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve Article
            </button>
            <button
              onClick={() => setShowRejectDialog(true)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject Article
            </button>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Confirm Rejection
            </h3>
            {!feedback.trim() ? (
              <p className="text-red-600 dark:text-red-400 mb-4">
                Please provide feedback before rejecting the article.
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to reject this article? This action cannot be undone.
              </p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowRejectDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!feedback.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 