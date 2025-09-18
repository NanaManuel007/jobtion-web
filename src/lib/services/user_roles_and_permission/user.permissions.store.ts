import { writable, get } from 'svelte/store';
import type { Permission } from './user.permissions.types';
import { PermissionService } from './user.permissions.services';

// Store for all permissions
export const permissions = writable<Permission[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const selectedPermission = writable<Permission | null>(null);

// Actions for managing permissions
export const permissionActions = {
    // Fetch all permissions
    async fetchPermissions() {
        isLoading.set(true);
        error.set(null);
        
        try {
            const fetchedPermissions = await PermissionService.getAllPermissions();
            permissions.set(fetchedPermissions);
            console.log('Fetched permissions:', fetchedPermissions);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch permissions';
            error.set(errorMessage);
        } finally {
            isLoading.set(false);
        }
    },
    
    // Add a new permission
    async addPermission(permission: Omit<Permission, 'id'>) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await PermissionService.createPermission(permission);
            if (result.success) {
                // Refresh permissions list after adding
                await this.fetchPermissions();
                return { success: true, message: 'Permission created successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create permission';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Update an existing permission
    async updatePermission(permission: Permission) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await PermissionService.updatePermission(permission);
            if (result.success) {
                // Refresh permissions list after updating
                await this.fetchPermissions();
                return { success: true, message: 'Permission updated successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update permission';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Delete a permission
    async deletePermission(id: string) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await PermissionService.deletePermission(id);
            if (result.success) {
                // Refresh permissions list after deletion
                await this.fetchPermissions();
                return { success: true, message: 'Permission deleted successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete permission';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Set a permission as selected
    selectPermission(permission: Permission | null) {
        selectedPermission.set(permission);
    }
};