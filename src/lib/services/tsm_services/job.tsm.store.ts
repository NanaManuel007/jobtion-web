import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { TimesheetEntry, TSM, TSMUpdatePayload } from './job.tsm.types';
import { writable } from 'svelte/store';
import { TSMService } from './job.tsm.services';

// Store for all TSMs
export const tsms = writable<TSM[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const selectedTSM = writable<TSM | null>(null);
export const reports = writable<TimesheetEntry[]>([]);
// TSM Store Actions
export const tsmActions = {
    async fetchAllTSMs() {
        isLoading.set(true);
        error.set(null);
        
        try {
            const data = await TSMService.getAllTSMs();
            tsms.set(data);
            console.log(data)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch TSMs';
            error.set(errorMessage);
            console.error('Error fetching TSMs:', err);
        } finally {
            isLoading.set(false);
        }
    },
    
    async approveTSM(tsmId: number) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const success = await TSMService.approveTSM(tsmId);
            
            if (success) {
                // Update the local store
                tsms.update(currentTSMs => {
                    return currentTSMs.map(tsm => {
                        if (tsm.id === tsmId) {
                            return { ...tsm, break_time_updated: 2 }; 
                        }
                        return tsm;
                    });
                });
            } else {
                throw new Error('Failed to approve TSM');
            }
            
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to approve TSM';
            error.set(errorMessage);
            console.error('Error approving TSM:', err);
            return false;
        } finally {
            isLoading.set(false);
        }
    },
    async declineTSM(tsmId: number) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const success = await TSMService.declineTSM(tsmId);
            
            if (success) {
                // Update the local store
                tsms.update(currentTSMs => {
                    return currentTSMs.map(tsm => {
                        if (tsm.id === tsmId) {
                            return { ...tsm, break_time_updated: 3 }; 
                        }
                        return tsm;
                    });
                });
            } else {
                throw new Error('Failed to approve TSM');
            }
            
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to approve TSM';
            error.set(errorMessage);
            console.error('Error approving TSM:', err);
            return false;
        } finally {
            isLoading.set(false);
        }
    },
    
    async updateTSM(payload: TSMUpdatePayload) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const success = await TSMService.updateTSM(payload);
            
            if (success) {
                // Refresh the TSM data
                await this.fetchAllTSMs();
            } else {
                throw new Error('Failed to update TSM');
            }
            
            return success;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update TSM';
            error.set(errorMessage);
            console.error('Error updating TSM:', err);
            return false;
        } finally {
            isLoading.set(false);
        }
    },

    // get report store

    async fetchReport() {
        isLoading.set(true);
        error.set(null);
        
        try {
            const data = await TSMService.getReport();
            console.log('Report data received:', data);
            reports.set(data);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report';
            error.set(errorMessage);
            console.error('Error fetching report:', err);
            return false;
        } finally {
            isLoading.set(false);
        }
    }
};