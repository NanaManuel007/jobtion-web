import { writable, get } from 'svelte/store';
import type { 
    ClientsType, 
    ClientsResponse, 
    SelectedClientType, 
    ClientStatisticsResponse,
    ClientChargesResponse,
    ClientCustomFieldsResponse,
    ClientChargesUpdateRequest,
    ClientCustomFieldsUpdateRequest,
    ClientContactsResponse,
    ClientContactCreateRequest,
    ClientContactUpdateRequest
} from './client.type';
import { ClientService } from './client.services';

// Client data stores
export const clients = writable<ClientsType[]>([]);
export const allClients = writable<ClientsType[]>([]);
export const totalClients = writable<number>(0);
export const isLoading = writable<boolean>(false);
export const loadingData = writable<boolean>(false);
export const selectedClient = writable<SelectedClientType | null>(null);

// Pagination stores
export const currentPage = writable<number>(1);
export const pageSize = writable<number>(10);
export const totalPages = writable<number>(0);
export const totalCount = writable<number>(0);

// Search store
export const searchTerm = writable<string>('');

// Debounce timer for search
let searchDebounceTimer: ReturnType<typeof setTimeout>;

// Statistics store
export const clientStatistics = writable<ClientStatisticsResponse | null>(null);
export const statisticsLoading = writable<boolean>(false);

// New stores for charges and custom fields
export const clientCharges = writable<ClientChargesResponse | null>(null);
export const clientCustomFields = writable<ClientCustomFieldsResponse | null>(null);
export const chargesLoading = writable<boolean>(false);
export const customFieldsLoading = writable<boolean>(false);

// Contact stores
export const clientContacts = writable<ClientContactsResponse | null>(null);
export const contactsLoading = writable<boolean>(false);
export const contactsError = writable<string | null>(null);

export const clientActions = {
    async fetchClients(page?: number, size?: number, search?: string) {
        if (get(isLoading)) {
            console.log('Already fetching clients, skipping request');
            return;
        }
        
        isLoading.set(true);
        try {
            const currentPageValue = page ?? get(currentPage);
            const pageSizeValue = size ?? get(pageSize);
            const searchValue = search ?? get(searchTerm);
            
            const result = await ClientService.getAllClients(currentPageValue, pageSizeValue, searchValue);
            
            if (result.success && result.data) {
                clients.set(result.data.clients);
                allClients.set(result.data.clients);
                totalClients.set(result.data.totalCount);
                currentPage.set(result.data.currentPage);
                pageSize.set(result.data.pageSize);
                totalPages.set(result.data.totalPages);
                totalCount.set(result.data.totalCount);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            isLoading.set(false);
        }
    },
    
    async changePage(page: number) {
        currentPage.set(page);
        await this.fetchClients(page);
    },
    
    async changePageSize(size: number) {
        pageSize.set(size);
        currentPage.set(1); // Reset to first page when changing page size
        await this.fetchClients(1, size);
    },
    
    async search(term: string) {
        console.log('Store search called with term:', term);
        // Clear existing timer
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }
        
        // Set search term
        searchTerm.set(term);
        
        // Debounce search to avoid too many API calls
        searchDebounceTimer = setTimeout(async () => {
            console.log('Debounced search executing with term:', term);
            currentPage.set(1); // Reset to first page when searching
            await this.fetchClients(1, undefined, term);
        }, 300);
    },
    
    async refresh() {
        await this.fetchClients();
    },

    // async getApplicantById(candidateId: number): Promise<AppliedCandidate | null> {
    //     isLoading.set(true);
    //     try {
    //         const client = get(selectedClient);
    //         if (!client?.data?.applied_candidates) {
    //             console.log('No client data or applied candidates available');
    //             return null;
    //         }
    //         const candidate = client.data.applied_candidates.find(c => c.candidate_id === candidateId);
    //         return candidate || null;
    //     } catch (error) {
    //         console.error('Error in getApplicantById:', error);
    //         return null;
    //     } finally {
    //         isLoading.set(false);
    //     }
    // },
    // async getClientById(id: number) {
    //     isLoading.set(true);
    //     try {
    //         // First check if we already have the client in our store
    //         const allClientsData = get(allClients);
    //         let client = allClientsData.find(c => c.id === id);
            
    //         // If not found in store, try to fetch from API
    //         if (!client) {
    //             // If there's no endpoint, fetch all clients and then find the one we need
    //             if (allClientsData.length === 0) {
    //                 await this.fetchClients(); // Fetch with larger limit to increase chances of finding the client
    //                 const refreshedClients = get(allClients);
    //                 client = refreshedClients.find(c => c.id === id);
    //             }
    //         }
            
    //         selectedClient.set(client || null);
    //         return client || null;
    //     } catch (error) {
    //         console.error('Error in getClientById:', error);
    //         return null;
    //     } finally {
    //         isLoading.set(false);
    //     }
    // },
    
    // async approveClient(id: number) {
    //     isLoading.set(true);
    //     try {
    //         const success = await ClientService.approveClient(id);
    //         if (success) {
    //             // Refresh the client list after approval
    //             await this.fetchClients(currentPage.get());
    //         }
    //         return success;
    //     } catch (error) {
    //         console.error('Error in approveClient:', error);
    //         return false;
    //     } finally {
    //         isLoading.set(false);
    //     }
    // }

    async getClientById(id: string) {
        isLoading.set(true);
        try {
            const client = await ClientService.getClientById(id);
    
            selectedClient.set(client || null);
            console.log("client store", client);
            return client;
        } catch (error) {
            console.error('Error in getClientById:', error);
            selectedClient.set(null);
            return null;
        } finally {
            isLoading.set(false);
        }
    },

    async getClientByIdLoad(id: string) {
        loadingData.set(true);
        try {
            const client = await ClientService.getClientById(id);
    
            selectedClient.set(client || null);
            loadingData.set(false);

            console.log("client store", client);
            return client;
        } catch (error) {
            console.error('Error in getClientById:', error);
            return null;
        } finally {
            loadingData.set(false);
        }
    },

    //statistic
    async getClientStatistics(id: string) {
        statisticsLoading.set(true);
        try {
            const statistics = await ClientService.getClientStatistics(id);
            clientStatistics.set(statistics);
            console.log("statistics store", statistics);
            return statistics;
        } catch (error) {
            console.error('Error in getClientStatistics:', error);
            clientStatistics.set(null);
            return null;
        } finally {
            statisticsLoading.set(false);
        }
    },

    // Client Charges Actions
    async getClientCharges(clientId: string) {
        chargesLoading.set(true);
        try {
            const charges = await ClientService.getClientCharges(clientId);
            clientCharges.set(charges);
            return charges;
        } catch (error) {
            console.error('Error in getClientCharges:', error);
            clientCharges.set(null);
            return null;
        } finally {
            chargesLoading.set(false);
        }
    },

    async updateClientCharges(clientId: string, charges: ClientChargesUpdateRequest) {
        chargesLoading.set(true);
        try {
            const result = await ClientService.updateClientCharges(clientId, charges);
            if (result.success) {
                // Refresh charges data after successful update
                await this.getClientCharges(clientId);
            }
            return result;
        } catch (error) {
            console.error('Error in updateClientCharges:', error);
            return { success: false, message: 'An error occurred while updating charges' };
        } finally {
            chargesLoading.set(false);
        }
    },

    // Custom Fields Actions
    async getClientCustomFields(clientId: string) {
        customFieldsLoading.set(true);
        try {
            const customFields = await ClientService.getClientCustomFields(clientId);
            clientCustomFields.set(customFields);
            return customFields;
        } catch (error) {
            console.error('Error in getClientCustomFields:', error);
            clientCustomFields.set(null);
            return null;
        } finally {
            customFieldsLoading.set(false);
        }
    },

    async updateClientCustomFields(clientId: string, customFields: ClientCustomFieldsUpdateRequest) {
        customFieldsLoading.set(true);
        try {
            const result = await ClientService.updateClientCustomFields(clientId, customFields);
            if (result.success) {
                // Refresh custom fields data after successful update
                await this.getClientCustomFields(clientId);
            }
            return result;
        } catch (error) {
            console.error('Error in updateClientCustomFields:', error);
            return { success: false, message: 'An error occurred while updating custom fields' };
        } finally {
            customFieldsLoading.set(false);
        }
    },

    // Contact Actions
    async getClientContacts(clientId: string) {
        contactsLoading.set(true);
        contactsError.set(null);
        try {
            const contacts = await ClientService.getClientContacts(clientId);
            clientContacts.set(contacts);
            return contacts;
        } catch (error) {
            console.error('Error in getClientContacts:', error);
            contactsError.set('Failed to fetch contacts');
            clientContacts.set(null);
            return null;
        } finally {
            contactsLoading.set(false);
        }
    },

    async createClientContact(clientId: string, contact: ClientContactCreateRequest) {
        contactsLoading.set(true);
        contactsError.set(null);
        try {
            const result = await ClientService.createClientContact(clientId, contact);
            if (result.success) {
                // Refresh contacts data after successful creation
                await this.getClientContacts(clientId);
            }
            return result;
        } catch (error) {
            console.error('Error in createClientContact:', error);
            contactsError.set('Failed to create contact');
            return { success: false, message: 'An error occurred while creating contact' };
        } finally {
            contactsLoading.set(false);
        }
    },

    async updateClientContact(clientId: string, contactId: string, contact: ClientContactUpdateRequest) {
        contactsLoading.set(true);
        contactsError.set(null);
        try {
            const result = await ClientService.updateClientContact(clientId, contactId, contact);
            if (result.success) {
                // Refresh contacts data after successful update
                await this.getClientContacts(clientId);
            }
            return result;
        } catch (error) {
            console.error('Error in updateClientContact:', error);
            contactsError.set('Failed to update contact');
            return { success: false, message: 'An error occurred while updating contact' };
        } finally {
            contactsLoading.set(false);
        }
    },

    async deleteClientContact(clientId: string, contactId: string) {
        contactsLoading.set(true);
        contactsError.set(null);
        try {
            const result = await ClientService.deleteClientContact(clientId, contactId);
            if (result.success) {
                // Refresh contacts data after successful deletion
                await this.getClientContacts(clientId);
            }
            return result;
        } catch (error) {
            console.error('Error in deleteClientContact:', error);
            contactsError.set('Failed to delete contact');
            return { success: false, message: 'An error occurred while deleting contact' };
        } finally {
            contactsLoading.set(false);
        }
    }
};