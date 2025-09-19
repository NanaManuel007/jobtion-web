  
export type AddAdmin = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  RoleIds: string[];
  enableTwoFactor: boolean;
};

export type EditAdmin = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleIds: string[];
  enableTwoFactor?: boolean;
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