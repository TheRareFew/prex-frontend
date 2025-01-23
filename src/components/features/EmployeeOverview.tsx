import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const EmployeeOverview: React.FC = () => {
  const { isManager, userRole } = useAuth();

  if (!isManager && userRole !== 'admin') {
    return (
      <div className="p-4 text-red-600">
        Access denied. Manager or admin privileges required.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4 dark:text-white">
        Employee Overview
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          This page will display employee performance metrics, workload distribution, and management tools.
        </p>
      </div>
    </div>
  );
}; 