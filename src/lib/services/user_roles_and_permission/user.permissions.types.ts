export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface PermissionApiResponse {
  data: Permission[];
  success: boolean;
  statusCode: number;
  responseBody: null;
  errors: null;
  timestamp: string;
}

// Permission categories based on the API response
export const PERMISSION_CATEGORIES = [
  'Permissions',
  'Admins', 
  'Users',
  'Reports',
  'System'
] as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[number];