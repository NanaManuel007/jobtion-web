import { writable } from 'svelte/store';
import type { AdminDetails } from './auth.type';
import { goto } from '$app/navigation';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    refreshToken: string | null;
    user: AdminDetails | null;
    roles: string[] | null;
    permissions: string[] | null;
}

const createAuthStore = () => {
    const { subscribe, set, update } = writable<AuthState>({
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        roles: null,
        permissions: null
    });

    return {
        subscribe,
        
        setAuthenticated: (value: boolean) => {
            update(state => ({
                ...state,
                isAuthenticated: value
            }));
        },

        setToken: (token: string, refreshToken?: string) => {
            localStorage.setItem('access_token', token);
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }
            update(state => ({
                ...state,
                token,
                refreshToken: refreshToken || state.refreshToken,
                isAuthenticated: true
            }));
        },
        
        setAdminDetails: (adminDetails: AdminDetails) => {
            localStorage.setItem('user', JSON.stringify(adminDetails));
            localStorage.setItem('roles', JSON.stringify(adminDetails.roles));
            localStorage.setItem('permissions', JSON.stringify(adminDetails.permissions));
            
            update(state => ({
                ...state,
                user: adminDetails,
                roles: adminDetails.roles,
                permissions: adminDetails.permissions
            }));
        },
        
        logout: async () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('roles');
            localStorage.removeItem('permissions');
            set({
                isAuthenticated: false,
                token: null,
                refreshToken: null,
                user: null,
                roles: null,
                permissions: null
            });
            await goto('/');
        },
        
        checkTokenExpiration: () => {
            const token = localStorage.getItem('access_token');
            const store = auth; 
            if (!token) return false;
            
            try {
                // JWT tokens are in format: header.payload.signature
                const payload = token.split('.')[1];
                if (!payload) return false;
                
                // Decode the base64 payload
                const decodedPayload = JSON.parse(atob(payload));
                
                // Check if token has expired
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
                
                if (decodedPayload.exp && decodedPayload.exp < currentTime) {
                    // Token has expired, log the user out
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('roles');
                    localStorage.removeItem('permissions');
                    set({
                        isAuthenticated: false,
                        token: null,
                        refreshToken: null,
                        user: null,
                        roles: null,
                        permissions: null
                    });
                    // Use the store instance instead of 'this'
                    store.logout();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error checking token expiration:', error);
                return false;
            }
        },

        initialize: () => {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            const user = localStorage.getItem('user');
            const roles = localStorage.getItem('roles');
            const permissions = localStorage.getItem('permissions');
            const store = auth; 
            
            if (!token) {
                store.logout();
                return;
            }
            
            // Check if token has expired before initializing
            if (token && !store.checkTokenExpiration()) {
                set({
                    isAuthenticated: true,
                    token,
                    refreshToken,
                    user: user ? JSON.parse(user) : null,
                    roles: roles ? JSON.parse(roles) : null,
                    permissions: permissions ? JSON.parse(permissions) : null
                });
            }
        }
    };
};

export const auth = createAuthStore();