
export interface AdminDetails {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isSuperAdmin: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
    lastLoginAt: string;
    roles: string[];
    permissions: string[];
}

export interface AdminLoginResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
        admin: AdminDetails;
    }
}