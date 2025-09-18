
export type RoleAccess = string;

export interface RoleApiResponse {
  id: string; // Changed from number to string (UUID)
  name: string; // Changed from role_name to name
  description: string; // Changed from role_description to description
  isActive: boolean; // Added isActive field
  permissions: string[]; // Changed to string[] to match actual API response
}

export interface Permission {
  id: string; // UUID
  name: string;
  description?: string;
  category?: string;
}

// For API requests
export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: string[]; // Array of permission UUIDs
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
  isActive: boolean;
  permissionIds: string[]; // Array of permission UUIDs
}

export const ROLE_ACCESS_LIST: RoleAccess[] = [
    'CreateUser', 
    'DeleteUser', 
    'UpdateUser', 
    'ViewUser', 
    'ViewAllUser', 
    'SeeAnalytics', 
    'ReadRoles', 
    'CreateClient', 
    'DeleteClient', 
    'UpdateClient', 
    'ViewClient', 
    'ViewAllClient', 
    'ReadJobs', 
    'CreateJob', 
    'DeleteJob', 
    'UpdateJob', 
    'ViewJob', 
    'ViewAllJob', 
    'ReadJobApplications', 
    'CreateJobApplication', 
    'DeleteJobApplication', 
    'UpdateJobApplication', 
    'ViewJobApplication', 
    'ViewAllJobApplication', 
    'SeeReports', 
    'AllAdmin', 
    'CreateRoles', 
    'SeeFinancials'
];