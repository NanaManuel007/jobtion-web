//services
import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { AddAdmin, EditAdmin, SystemUser } from './system.user.types';

export class SystemUserService {
    static async getAllAdmins(): Promise<SystemUser[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.ALLADMINS), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch system users');
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                return data.data.map((user: any) => ({
                    id: user.id,
                    email: user.email,
                    userName: user.username,
                    roleId: user.role_id,
                    roleDescription: user.role_description,
                    roleName: user.role_name,
                    fullName: user.full_name,
                    access: user.access || []
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching system users:', error);
            return [];
        }
    }

    static async addAdmin(admin: AddAdmin): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            const apiPayload = {
                username: admin.userName,
                full_name: admin.fullName, 
                email: admin.email,
                role_id: admin.roleId,
                password: admin.password,
                confirm_password: admin.confirmPassword
            };
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.CREATEADMIN), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiPayload)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to add admin' 
                };
            }
            
            return {
                success: true,
                message: 'Admin added successfully'
            };
        } catch (error) {
            console.error('Error adding admin:', error);
            return {
                success: false,
                message: 'An error occurred while adding the admin'
            };
        }
    }

    static async updateAdmin(admin: EditAdmin): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const payload = {
                'id': admin.id,
                'role_id': admin.roleId,
                'full_name': admin.fullName,
                'username': admin.userName,
                'email': admin.email
            };
            
            console.log("user payload",payload)
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.EDITADMIN), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to update admin' 
                };
            }
            
            return {
                success: true,
                message: 'Admin updated successfully'
            };
        } catch (error) {
            console.error('Error updating admin:', error);
            return {
                success: false,
                message: 'An error occurred while updating the admin'
            };
        }
    }
}