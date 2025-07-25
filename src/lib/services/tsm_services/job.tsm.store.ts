import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { TSM, Approval, TSMUpdatePayload, InvoiceEntry, PaginationParams, PaginatedInvoiceResponse, PayslipResponse, PayslipPaginationParams, GroupedPayslip, PaginationMeta, ClientInvoiceGroup, ClientInvoicePaginationParams, PaginatedClientInvoiceResponse } from './job.tsm.types';
import { writable } from 'svelte/store';
import { TSMService } from './job.tsm.services';

// Store for all TSMs
export const tsms = writable<TSM[]>([]);
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);
export const selectedTSM = writable<TSM | null>(null);
// Update store to use InvoiceEntry instead of TimesheetEntry
export const reports = writable<InvoiceEntry[]>([]);
export const reportsPagination = writable<PaginationMeta>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
});

export const candidatePayslips = writable<GroupedPayslip[]>([]);
export const payslipsPagination = writable({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
});
export const isLoadingPayslips = writable(false);
export const payslipsError = writable<string | null>(null);


export const clientInvoices = writable<ClientInvoiceGroup[]>([]);
export const clientInvoicesPagination = writable({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10
});
export const isLoadingClientInvoices = writable(false);
export const clientInvoicesError = writable<string | null>(null);

// export {
//     clientInvoices,
//     clientInvoicesPagination,
//     isLoadingClientInvoices,
//     clientInvoicesError
// } from './job.tsm.store';

// Export client invoice actions
export const clientInvoiceActions = {
    fetchClientInvoices: async (params = {}) => {
        const { tsmActions } = await import('./job.tsm.store');
        return tsmActions.fetchClientInvoices(params);
    }
};
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

    async fetchCandidatePayslips(params: PayslipPaginationParams = {}) {
        isLoadingPayslips.set(true);
        payslipsError.set(null);
        
        try {
            const response = await TSMService.getCandidatePayslips(params);
            
            if (response.success) {
                // Fix: Use candidatePayslips instead of groupedPayslips
                candidatePayslips.set(response.data.candidatePayslips);
                payslipsPagination.set({
                    totalCount: response.data.totalCount,
                    pageNumber: response.data.pageNumber,
                    pageSize: response.data.pageSize
                });
            } else {
                throw new Error('Failed to fetch candidate payslips');
            }
        } catch (error) {
            console.error('Error fetching candidate payslips:', error);
            payslipsError.set(error instanceof Error ? error.message : 'Unknown error occurred');
            candidatePayslips.set([]);
        } finally {
            isLoadingPayslips.set(false);
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

    // Updated fetchReport method to support pagination
    // async fetchReport(params: PaginationParams = {}) {
    //     isLoading.set(true);
    //     error.set(null);
        
    //     try {
    //         const data = await TSMService.getReport(params);
    //         console.log('Report data received:', data);
    //         reports.set(data.invoices);
    //         reportsPagination.set(data.pagination);
    //         return true;
    //     } catch (err) {
    //         const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report';
    //         error.set(errorMessage);
    //         console.error('Error fetching report:', err);
    //         return false;
    //     } finally {
    //         isLoading.set(false);
    //     }
    // },
    // Updated fetchReport method to support date filtering
    async fetchReport(params: PaginationParams = {}) {
        isLoading.set(true);
        error.set(null);
        
        try {
            const data = await TSMService.getReport(params);
            console.log('Report data received:', data);
            reports.set(data.invoices);
            reportsPagination.set(data.pagination);
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report';
            error.set(errorMessage);
            console.error('Error fetching report:', err);
            return false;
        } finally {
            isLoading.set(false);
        }
    },

    // Client Invoice Actions
    async fetchClientInvoices(params: ClientInvoicePaginationParams = {}) {
        isLoadingClientInvoices.set(true);
        clientInvoicesError.set(null);
        
        try {
            const response = await TSMService.getClientInvoices(params);
            
            clientInvoices.set(response.clientInvoices);
            clientInvoicesPagination.set(response.pagination);
            
            return true;
        } catch (error) {
            console.error('Error fetching client invoices:', error);
            clientInvoicesError.set(error instanceof Error ? error.message : 'Unknown error occurred');
            clientInvoices.set([]);
            return false;
        } finally {
            isLoadingClientInvoices.set(false);
        }
    }
};
