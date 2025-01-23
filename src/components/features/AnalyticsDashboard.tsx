import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AnalyticsDashboard: React.FC = () => {
  const { userRole } = useAuth();

  if (userRole !== 'admin') {
    return (
      <div className="p-4 text-red-600">
        Access denied. Admin privileges required.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">
        Analytics Dashboard
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          This page will display system-wide analytics, metrics, and performance indicators.
        </p>
      </div>
    </div>
  );
}; 