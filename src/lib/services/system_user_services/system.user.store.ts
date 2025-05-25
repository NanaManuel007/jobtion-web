//all user store
import { writable, get } from 'svelte/store';
import type {AddAdmin, EditAdmin, SystemUser } from './system.user.types';
import { SystemUserService } from './system.user.services';

// Store for all system users
export const systemUsers = writable<SystemUser[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const selectedUser = writable<SystemUser | null>(null);

// Actions for managing system users
export const systemUserActions = {
    // Fetch all system users
    async fetchSystemUsers() {
        isLoading.set(true);
        error.set(null);
        
        try {
            const fetchedUsers = await SystemUserService.getAllAdmins();
            systemUsers.set(fetchedUsers);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system users';
            error.set(errorMessage);
        } finally {
            isLoading.set(false);
        }
    },
    
    // Add a new system user
    async addSystemUser(userData: AddAdmin) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await SystemUserService.addAdmin(userData);
            if (result.success) {
                // Refresh users list after adding
                await this.fetchSystemUsers();
                return { success: true, message: 'User added successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add user';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Update an existing system user
    async updateSystemUser(userData: EditAdmin) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const result = await SystemUserService.updateAdmin(userData);
            if (result.success) {
                // Refresh users list after updating
                await this.fetchSystemUsers();
                return { success: true, message: 'User updated successfully' };
            }
            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
            error.set(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            isLoading.set(false);
        }
    },
    
    // Set a user as selected
    selectUser(user: SystemUser | null) {
        selectedUser.set(user);
    }
};