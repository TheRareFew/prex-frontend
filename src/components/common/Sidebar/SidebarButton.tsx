import React from 'react';
import { SidebarButtonProps } from './types';

export const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  disabled = false,
  tooltip,
  className = '',
  isCollapsed = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        group relative flex items-center w-full p-3 
        transition-colors duration-200
        ${isCollapsed ? 'justify-center' : 'justify-start'}
        ${isActive 
          ? 'bg-blue-500 text-white dark:bg-purple-500 dark:text-white' 
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={label}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-6 h-6">
        {icon}
      </div>

      {/* Label */}
      <div className={`
        overflow-hidden transition-all duration-300
        ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
      `}>
        <span className="ml-3 text-sm font-medium whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="
          absolute left-full ml-2 px-2 py-1 
          bg-gray-800 text-white text-xs rounded 
          opacity-0 group-hover:opacity-100
          pointer-events-none transition-opacity duration-200
          whitespace-nowrap
        ">
          {tooltip}
        </div>
      )}
    </button>
  );
}; 