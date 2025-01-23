import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, isManager } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleViewSwitch = (view: 'customer' | 'employee' | 'manager') => {
    navigate(`/dashboard/${view}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold dark:text-white">Support Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              <button
                onClick={() => handleViewSwitch('customer')}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                Customer View
              </button>
              <button
                onClick={() => handleViewSwitch('employee')}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                Employee View
              </button>
              {isManager && (
                <button
                  onClick={() => handleViewSwitch('manager')}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  Manager View
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}; 