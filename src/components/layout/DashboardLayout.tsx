import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleViewSwitch = (view: 'customer' | 'employee') => {
    navigate(`/dashboard/${view}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold">Support Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleViewSwitch('customer')}
                className="px-3 py-2 rounded-md text-sm font-medium"
              >
                Customer View
              </button>
              <button
                onClick={() => handleViewSwitch('employee')}
                className="px-3 py-2 rounded-md text-sm font-medium"
              >
                Employee View
              </button>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600"
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