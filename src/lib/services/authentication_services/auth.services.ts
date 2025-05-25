import { goto } from '$app/navigation';
import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { AccessRole, AdminLoginResponse} from '$lib/services/authentication_services/auth.type';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResult {
    success: boolean;
    message: string;
    token?: string;
    user?: any;
    access?: AccessRole; // Using the specific type
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
                const token = data.data.access_token;
                const user = data.data.admin_details;
                const access = data.data.access;
                
                console.log("this is token from login ",token);
                // Store auth data
                localStorage.setItem('access_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('access', JSON.stringify(access));

                return {
                    success: true,
                    message: data.message,
                    token,
                    user,
                    access
                };
            }

            return {
                success: false,
                message: data.message || 'Login failed'
            };
        } catch (error) {
            return {
                success: false,
                message: 'An error occurred. Please try again.'
            };
        }
    }
    static getAdminDetails() {
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
    
    static getAccessRole() {
        try {
            const accessData = localStorage.getItem('access');
            if (accessData) {
                return JSON.parse(accessData);
            }
            return null;
        } catch (error) {
            console.error('Error fetching access role:', error);
            return null;
        }
    }
        
    // static async getUserDetails(): Promise<UserDetails | null> {
    //     try {
    //         // Get access token from localStorage
    //         const token = localStorage.getItem('access_token');
            
    //         if (!token) {
    //             console.error('No access token found');
    //             return null;
    //         }
            
    //         // Try to get from localStorage first for performance
    //         const cachedUser = localStorage.getItem('user');
    //         if (cachedUser) {
    //             try {
    //                 return JSON.parse(cachedUser);
    //             } catch (e) {
    //                 // If parsing fails, continue to fetch from API
    //                 console.warn('Failed to parse cached user data');
    //             }
    //         }
            
    //         // Fetch fresh data from API
    //         const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USERS.PROFILE), {
    //             method: 'GET',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         });
            
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch user details');
    //         }
            
    //         const data = await response.json();
            
    //         if (data.success && data.data?.userDetails?.details?.length > 0) {
    //             const userDetails = data.data.userDetails.details[0];
    //             // Update cached user data
    //             localStorage.setItem('user', JSON.stringify(userDetails));
    //             return userDetails;
    //         }
            
    //         return null;
    //     } catch (error) {
    //         console.error('Error fetching user details:', error);
    //         return null;
    //     }
    // }

    static async logout(): Promise<void> {
        try {
          
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('access'); 
            await goto('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// static async logout(): Promise<void> {
//     try {
//         // Clear local storage
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('user');
        
//         // Redirect to login page
//         await goto('/');
//     } catch (error) {
//         console.error('Logout error:', error);
//     }
// }