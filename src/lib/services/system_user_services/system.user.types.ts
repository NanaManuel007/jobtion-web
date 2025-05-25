  
  export type AddAdmin = {
    userName: string;
    email: string;
    roleId: number;
    fullName: string;
    password: string;
    confirmPassword: string;
  };

  export type EditAdmin = {
    id: number;
    fullName: string;
    userName: string;
    email: string;
    roleId: number;
  };

  export type RoleAccess = string;
  export type SystemUser ={
    id: number;
    email: string;
    userName: string;
    roleId: number;
    roleDescription: string;
    roleName: string;
    fullName: string;
    access: RoleAccess[];
  }