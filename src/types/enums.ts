export enum PermissionType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
}

export enum DepartmentType {
  SALES = 'sales',
  MARKETING = 'marketing',
  SUPPORT = 'support',
  ENGINEERING = 'engineering',
  OTHER = 'other',
}

export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
}

export enum TicketStatus {
  FRESH = 'fresh',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  GENERAL = 'general',
  BILLING = 'billing',
  TECHNICAL = 'technical',
  FEEDBACK = 'feedback',
  ACCOUNT = 'account',
  FEATURE_REQUEST = 'feature_request',
  OTHER = 'other',
} 