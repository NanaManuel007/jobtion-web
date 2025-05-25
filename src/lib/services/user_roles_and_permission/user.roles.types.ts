
export type RoleAccess = string;


export interface RoleApiResponse {
  id:number;
  role_name: string;
  role_description: string;
  access: RoleAccess[];
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