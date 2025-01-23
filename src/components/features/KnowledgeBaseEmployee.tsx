import React from 'react';

export const KnowledgeBaseEmployee: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">
        Employee Knowledge Base
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          This page will contain the employee knowledge base content.
        </p>
      </div>
    </div>
  );
}; 