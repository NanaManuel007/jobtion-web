//user roles store
import { writable, get } from 'svelte/store';
import type { RoleApiResponse, CreateRoleRequest, UpdateRoleRequest } from './user.roles.types';
import { RoleService } from './user.roles.services';

// Store for all roles
export const roles = writable<RoleApiResponse[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const selectedRole = writable<RoleApiResponse | null>(null);

// Actions for managing roles
export const roleActions = {
    // Fetch all roles
    async fetchRoles() {
        isLoading.set(true);
        error.set(null);
        
        try {
            const fetchedRoles = await RoleService.getAllRoles();
            roles.set(fetchedRoles);
            console.log('Fetched roles:', fetchedRoles);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
            error.set(errorMessage);
        } finally {
            isLoading.set(false);
        }
    },
    
    // Add a new role
    async addRole(roleData: CreateRoleRequest) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await RoleService.addRole(roleData);
            if (result.success) {
                // Refresh roles list after adding
                await this.fetchRoles();
                return { success: true, message: 'Role added successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add role';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Update an existing role
    async updateRole(id: string, roleData: UpdateRoleRequest) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await RoleService.updateRole(id, roleData);
            if (result.success) {
                // Refresh roles list after updating
                await this.fetchRoles();
                return { success: true, message: 'Role updated successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Delete a role
    async deleteRole(id: string) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await RoleService.deleteRole(id);
            if (result.success) {
                // Refresh roles list after deletion
                await this.fetchRoles();
                return { success: true, message: 'Role deleted successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Set a role as selected
    selectRole(role: RoleApiResponse | null) {
        selectedRole.set(role);
    }
};