// user roles and permissions
import { getApiUrl } from '$lib/services/api';
import { API_CONFIG } from '$lib/services/api';
import type { RoleApiResponse } from './user.roles.types';

export class RoleService {

    static async getAllRoles(): Promise<RoleApiResponse[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLES.GETROLES), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }
            
            const data = await response.json();
            console.log(data)
            if (data.success && Array.isArray(data.data)) {
                return data.data.map((role: any) => ({
                    id: role.id,
                    role_name: role.role_name,
                    role_description: role.role_description || '',
                    access: role.access || []
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }
    

    static async addRole(role: RoleApiResponse): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLES.ADDROLE), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(role)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to add role' 
                };
            }
            
            return {
                success: true,
                message: 'Role added successfully'
            };
        } catch (error) {
            console.error('Error adding role:', error);
            return {
                success: false,
                message: 'An error occurred while adding the role'
            };
        }
    }
    

    static async updateRole(role: RoleApiResponse): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLES.UPDATEROLE), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(role)
            });
            
            const data = await response.json();
            console.log("id ", role.id)
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to update role' 
                };
            }
            
            return {
                success: true,
                message: 'Role updated successfully'
            };
        } catch (error) {
            console.error('Error updating role:', error);
            return {
                success: false,
                message: 'An error occurred while updating the role'
            };
        }
    }
    

 
    static async deleteRole(id: number): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLES.DELETEROLE), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "id": id })
            });
            
            const data = await response.json();
            console.log("this is id",id)
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to delete role' 
                };
            }
            
            return {
                success: true,
                message: 'Role deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting role:', error);
            return {
                success: false,
                message: 'An error occurred while deleting the role'
            };
        }
    }
}