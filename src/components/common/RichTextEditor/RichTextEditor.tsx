import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'align',
  'list', 'bullet',
  'link'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`rich-text-editor min-h-0 flex-1 ${className}`}>
      <style>
        {`
          .rich-text-editor {
            display: flex;
            flex-direction: column;
          }
          .rich-text-editor .quill {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .rich-text-editor .ql-container {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
          }
          .rich-text-editor .ql-editor {
            min-height: 100%;
          }
          .rich-text-editor .ql-toolbar.ql-snow {
            padding: 4px !important;
          }
          .rich-text-editor .ql-toolbar.ql-snow .ql-formats {
            margin-right: 8px !important;
          }
          .rich-text-editor .ql-toolbar.ql-snow button {
            width: 24px !important;
            height: 24px !important;
            padding: 2px !important;
          }
          .rich-text-editor .ql-toolbar.ql-snow .ql-picker {
            height: 24px !important;
          }
          .rich-text-editor .ql-toolbar.ql-snow .ql-picker-label {
            padding: 2px 4px !important;
          }
          .dark .rich-text-editor .ql-toolbar {
            background-color: rgb(17, 24, 39) !important;
            border-color: rgb(55, 65, 81) !important;
          }
          .dark .rich-text-editor .ql-toolbar button {
            color: rgb(229, 231, 235) !important;
          }
          .dark .rich-text-editor .ql-toolbar button:hover {
            color: white !important;
            background-color: rgb(55, 65, 81) !important;
          }
          .dark .rich-text-editor .ql-toolbar button.ql-active,
          .dark .rich-text-editor .ql-toolbar .ql-picker-label.ql-active {
            color: rgb(59, 130, 246) !important;
            background-color: rgb(30, 41, 59) !important;
          }
          .dark .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
            stroke: rgb(59, 130, 246) !important;
          }
          .dark .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
            fill: rgb(59, 130, 246) !important;
          }
          .dark .rich-text-editor .ql-toolbar .ql-stroke {
            stroke: rgb(229, 231, 235) !important;
          }
          .dark .rich-text-editor .ql-toolbar .ql-fill {
            fill: rgb(229, 231, 235) !important;
          }
          .dark .rich-text-editor .ql-toolbar .ql-picker {
            color: rgb(229, 231, 235) !important;
          }
          .dark .rich-text-editor .ql-toolbar .ql-picker-options {
            background-color: rgb(17, 24, 39) !important;
            border-color: rgb(55, 65, 81) !important;
          }
          .dark .rich-text-editor .ql-toolbar .ql-picker-item:hover,
          .dark .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected {
            color: rgb(59, 130, 246) !important;
            background-color: rgb(30, 41, 59) !important;
          }
          .dark .rich-text-editor .ql-container {
            border-color: rgb(55, 65, 81) !important;
          }
          .dark .rich-text-editor .ql-editor {
            background-color: rgb(17, 24, 39) !important;
            color: rgb(229, 231, 235) !important;
          }
          .dark .rich-text-editor .ql-editor.ql-blank::before {
            color: rgb(156, 163, 175) !important;
          }
        `}
      </style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        className="bg-white dark:bg-gray-900"
      />
    </div>
  );
}; 