import { getApiUrl } from '$lib/services/api';
import { API_CONFIG } from '$lib/services/api';
import type { Permission, PermissionApiResponse } from './user.permissions.types';

export class PermissionService {

    static async getAllPermissions(): Promise<Permission[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLESANDPERMISSION.ROLEPERMISSION), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }
            
            const data: PermissionApiResponse = await response.json();
            console.log('Permissions API Response:', data);
            
            if (data.success && Array.isArray(data.data)) {
                return data.data.map((permission: any) => ({
                    id: permission.id,
                    name: permission.name,
                    category: permission.category,
                    description: permission.description || ''
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }
    }

    static async createPermission(permission: Omit<Permission, 'id'>): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLESANDPERMISSION.ROLEPERMISSION), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(permission)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to create permission' 
                };
            }
            
            return {
                success: true,
                message: 'Permission created successfully'
            };
        } catch (error) {
            console.error('Error creating permission:', error);
            return {
                success: false,
                message: 'An error occurred while creating the permission'
            };
        }
    }

    static async updatePermission(permission: Permission): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLESANDPERMISSION.ROLEPERMISSION), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(permission)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to update permission' 
                };
            }
            
            return {
                success: true,
                message: 'Permission updated successfully'
            };
        } catch (error) {
            console.error('Error updating permission:', error);
            return {
                success: false,
                message: 'An error occurred while updating the permission'
            };
        }
    }

    static async deletePermission(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLESANDPERMISSION.ROLEPERMISSION), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "id": id })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to delete permission' 
                };
            }
            
            return {
                success: true,
                message: 'Permission deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting permission:', error);
            return {
                success: false,
                message: 'An error occurred while deleting the permission'
            };
        }
    }
}