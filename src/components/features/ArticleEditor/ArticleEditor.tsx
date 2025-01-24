import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RichTextEditor } from '../../common/RichTextEditor/RichTextEditor';
import { ArticleEditorProps, ArticleFormData } from './types';
import { article_category_type } from '../../../types/database';

const CATEGORY_OPTIONS: article_category_type[] = [
  'general',
  'product',
  'service',
  'troubleshooting',
  'faq',
  'policy',
  'other',
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  onSave,
  onSubmitForApproval,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    description: '',
    content: '',
    category: 'general',
    is_faq: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        description: article.description || '',
        content: article.content,
        category: article.category,
        is_faq: article.is_faq,
        tags: article.tags,
      });
    }
  }, [article]);

  const handleChange = (
    field: keyof ArticleFormData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleSave = () => {
    onSave({
      ...formData,
      status: 'draft',
    });
  };

  const handleSubmitForApproval = () => {
    onSubmitForApproval({
      ...formData,
      status: 'pending_approval',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">
          {article ? 'Edit Article' : 'Create New Article'}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSubmitForApproval}
            disabled={!formData.title || !formData.content}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:opacity-50"
          >
            Submit for Approval
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter article title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter article description"
            rows={3}
          />
        </div>

        {/* Category and FAQ */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                handleChange('category', e.target.value as article_category_type)
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_faq"
              checked={formData.is_faq}
              onChange={(e) => handleChange('is_faq', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="is_faq"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              This is a FAQ
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Add a tag"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <div className="min-h-[400px]">
            <RichTextEditor
              value={formData.content}
              onChange={(value) => handleChange('content', value)}
              placeholder="Write your article content here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 