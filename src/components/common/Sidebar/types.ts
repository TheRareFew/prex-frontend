import { ReactNode } from 'react';

export interface SidebarButtonProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  isCollapsed?: boolean;
}

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  children?: ReactNode;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'employee' | 'customer';

export type ViewSection = 'customer' | 'employee' | 'manager';

export interface NavigationItem {
  path: string;
  label: string;
  icon: ReactNode;
  roles: UserRole[];
  section: ViewSection;
  tooltip?: string;
} 