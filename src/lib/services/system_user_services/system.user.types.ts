  
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

  export type SystemUser = {
    id: string; // UUID
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isSuperAdmin: boolean;
    twoFactorEnabled: boolean;
    createdAt: string; // ISO date string
    lastLoginAt: string; // ISO date string
    roles: string[];
    permissions: string[];
  }