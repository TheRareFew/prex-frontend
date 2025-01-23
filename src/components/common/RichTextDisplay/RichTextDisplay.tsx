import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  className = '',
}) => {
  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div className={`rich-text-display ${className}`}>
      <style>
        {`
          .rich-text-display {
            overflow-wrap: break-word;
          }
          .rich-text-display h1 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.5em 0;
          }
          .rich-text-display h2 {
            font-size: 1.3em;
            font-weight: bold;
            margin: 0.5em 0;
          }
          .rich-text-display h3 {
            font-size: 1.1em;
            font-weight: bold;
            margin: 0.5em 0;
          }
          .rich-text-display p {
            margin: 0.5em 0;
          }
          .rich-text-display ul, .rich-text-display ol {
            margin: 0.5em 0;
            padding-left: 1.5em;
          }
          .rich-text-display ul {
            list-style-type: disc;
          }
          .rich-text-display ol {
            list-style-type: decimal;
          }
          .rich-text-display a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .rich-text-display a:hover {
            color: #2563eb;
          }
          .dark .rich-text-display a {
            color: #60a5fa;
          }
          .dark .rich-text-display a:hover {
            color: #93c5fd;
          }
          .rich-text-display blockquote {
            border-left: 3px solid #e5e7eb;
            padding-left: 1em;
            margin: 0.5em 0;
            color: #6b7280;
          }
          .dark .rich-text-display blockquote {
            border-left-color: #4b5563;
            color: #9ca3af;
          }
          /* Quill alignment classes */
          .rich-text-display .ql-align-center {
            text-align: center;
          }
          .rich-text-display .ql-align-right {
            text-align: right;
          }
          .rich-text-display .ql-align-justify {
            text-align: justify;
          }
          /* Default alignment (left) is handled automatically */
        `}
      </style>
      <div
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
}; 