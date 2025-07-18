import { goto } from '$app/navigation';
import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { AdminLoginResponse, AdminDetails } from '$lib/services/authentication_services/auth.type';

interface LoginCredentials {
    usernameOrEmail: string;
    password: string;
    twoFactorCode?: string; // Optional since not all users may have 2FA enabled
}

interface LoginResult {
    success: boolean;
    message: string;
    token?: string;
    user?: AdminDetails;
    roles?: string[];
    permissions?: string[];
}

export class AuthService {
    static async login(credentials: LoginCredentials): Promise<LoginResult> {
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
     
            const data: AdminLoginResponse = await response.json();
            console.log('this is data', data.data);
            
            if (data.success) {
                const token = data.data.accessToken;
                const user = data.data.admin;
                const roles = data.data.admin.roles;
                const permissions = data.data.admin.permissions;
                
                console.log("this is token from login ", token);
                // Store auth data
                localStorage.setItem('access_token', token);
                localStorage.setItem('refresh_token', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('roles', JSON.stringify(roles));
                localStorage.setItem('permissions', JSON.stringify(permissions));

                return {
                    success: true,
                    message: data.responseBody || 'Login successful',
                    token,
                    user,
                    roles,
                    permissions
                };
            }

            return {
                success: false,
                message: data.errors || 'Login failed'
            };
        } catch (error) {
            return {
                success: false,
                message: 'An error occurred. Please try again.'
            };
        }
    }
    
    static getAdminDetails(): AdminDetails | null {
        try {
            const adminData = localStorage.getItem('user');
            if (adminData) {
                return JSON.parse(adminData);
            }
            return null;
        } catch (error) {
            console.error('Error fetching admin details:', error);
            return null;
        }
    }
    
    static getRoles(): string[] | null {
        try {
            const rolesData = localStorage.getItem('roles');
            if (rolesData) {
                return JSON.parse(rolesData);
            }
            return null;
        } catch (error) {
            console.error('Error fetching roles:', error);
            return null;
        }
    }

    static getPermissions(): string[] | null {
        try {
            const permissionsData = localStorage.getItem('permissions');
            if (permissionsData) {
                return JSON.parse(permissionsData);
            }
            return null;
        } catch (error) {
            console.error('Error fetching permissions:', error);
            return null;
        }
    }

    static async logout(): Promise<void> {
        try {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('roles');
            localStorage.removeItem('permissions');
            await goto('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}
