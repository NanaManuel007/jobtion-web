import { writable } from 'svelte/store';
import type { AdminDetails, AccessRole } from './auth.type';
import { goto } from '$app/navigation';
interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: AdminDetails | null;
    access: AccessRole | null;
}

const createAuthStore = () => {
    const { subscribe, set, update } = writable<AuthState>({
        isAuthenticated: false,
        token: null,
        user: null,
        access: null
    });

    return {
        subscribe,
        
        setAuthenticated: (value: boolean) => {
            update(state => ({
                ...state,
                isAuthenticated: value
            }));
        },

        setToken: (token: string) => {
            localStorage.setItem('access_token', token);
            update(state => ({
                ...state,
                token,
                isAuthenticated: true
            }));
        },
        
        setAdminDetails: (adminDetails: AdminDetails, accessRole: AccessRole) => {
            localStorage.setItem('user', JSON.stringify(adminDetails));
            localStorage.setItem('access', JSON.stringify(accessRole));
            
            update(state => ({
                ...state,
                user: adminDetails,
                access: accessRole
            }));
        },
        logout: async () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('access');
            set({
                isAuthenticated: false,
                token: null,
                user: null,
                access: null
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
                    localStorage.removeItem('user');
                    localStorage.removeItem('access');
                    set({
                        isAuthenticated: false,
                        token: null,
                        user: null,
                        access: null
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
            const user = localStorage.getItem('user');
            const access = localStorage.getItem('access');
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
                    user: user ? JSON.parse(user) : null,
                    access: access ? JSON.parse(access) : null
                });
            }
        }
    };
};

export const auth = createAuthStore();