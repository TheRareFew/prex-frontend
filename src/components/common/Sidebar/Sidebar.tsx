import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { SidebarProps, NavigationItem } from './types';
import { SidebarButton } from './SidebarButton';
import { 
  UserIcon, 
  BookOpenIcon, 
  TicketIcon, 
  Cog6ToothIcon, 
  UsersIcon, 
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const navigationItems: NavigationItem[] = [
  // Customer View Items
  {
    path: '/dashboard/customer',
    label: 'Customer View',
    icon: <UserIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager', 'agent', 'employee', 'customer'],
    section: 'customer',
    tooltip: 'View customer interface'
  },

  // Employee View Items
  {
    path: '/dashboard/ticket-processing',
    label: 'Ticket Processing',
    icon: <TicketIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager', 'agent', 'employee'],
    section: 'employee',
    tooltip: 'Process and manage tickets'
  },
  {
    path: '/dashboard/knowledge-base-employee',
    label: 'Knowledge Base',
    icon: <BookOpenIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager', 'agent', 'employee'],
    section: 'employee',
    tooltip: 'Access employee knowledge base'
  },

  // Manager View Items
  {
    path: '/dashboard/ticket-management',
    label: 'Ticket Management',
    icon: <Cog6ToothIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager'],
    section: 'manager',
    tooltip: 'Manage ticket assignments'
  },
  {
    path: '/dashboard/knowledge-base-manager',
    label: 'Manager Knowledge Base',
    icon: <BookOpenIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager'],
    section: 'manager',
    tooltip: 'Access manager knowledge base'
  },
  {
    path: '/dashboard/employee-overview',
    label: 'Employee Overview',
    icon: <UsersIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager'],
    section: 'manager',
    tooltip: 'View employee performance'
  },
  {
    path: '/dashboard/analytics',
    label: 'Analytics',
    icon: <ChartBarIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager'],
    section: 'manager',
    tooltip: 'View system analytics'
  },
  {
    path: '/dashboard/agent-chat',
    label: 'Agent Chat',
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    roles: ['super_admin', 'admin', 'manager'],
    section: 'manager',
    tooltip: 'Monitor agent conversations'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = true,
  onToggleCollapse,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, loading } = useAuth();

  // Determine current section based on path
  const currentPath = location.pathname;
  const currentSection = (() => {
    if (currentPath.includes('/dashboard/manager') || 
        currentPath.includes('/dashboard/ticket-management') ||
        currentPath.includes('/dashboard/knowledge-base-manager') ||
        currentPath.includes('/dashboard/employee-overview') ||
        currentPath.includes('/dashboard/analytics') ||
        currentPath.includes('/dashboard/agent-chat')) {
      return 'manager';
    }
    if (currentPath.includes('/dashboard/employee') ||
        currentPath.includes('/dashboard/ticket-processing') ||
        currentPath.includes('/dashboard/knowledge-base-employee')) {
      return 'employee';
    }
    return 'customer';
  })();

  console.log('Sidebar Debug:', { userRole, currentSection, currentPath, loading });

  // Filter navigation items based on current section and user role
  const filteredNavigation = navigationItems.filter(item => 
    item.section === currentSection
  );

  // Add Customer View button at the bottom for employee and manager sections
  if ((currentSection === 'employee' || currentSection === 'manager')) {
    const customerViewButton = navigationItems.find(item => item.path === '/dashboard/customer');
    if (customerViewButton) {
      filteredNavigation.push(customerViewButton);
    }
  }

  if (loading) {
    return (
      <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className={`
        flex flex-col h-full bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700
        transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="
          p-3 m-2 rounded-lg
          hover:bg-gray-100 dark:hover:bg-gray-700
          text-gray-500 dark:text-gray-400
          self-end
        "
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-5 h-5" />
        ) : (
          <ChevronLeftIcon className="w-5 h-5" />
        )}
      </button>

      {/* Navigation Buttons */}
      <nav className="flex-1 space-y-1 px-2 flex flex-col items-center">
        {filteredNavigation.map((item) => (
          <SidebarButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            tooltip={isCollapsed ? item.label : undefined}
            disabled={!userRole || !item.roles.includes(userRole)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </div>
  );
}; 