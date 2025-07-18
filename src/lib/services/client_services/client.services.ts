import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { ClientsType, ClientListResponse, SelectedClientType, ClientsResponse, ClientStatisticsResponse, ClientChargesResponse, ClientChargesUpdateRequest, ClientCustomFieldsResponse, ClientCustomFieldsUpdateRequest, ClientContactsResponse, ClientContactCreateRequest, ClientContactUpdateRequest } from './client.type';

export class ClientService {
      static async getAllClients(page: number = 1, pageSize: number = 10, searchTerm: string = ''): Promise<ClientsResponse> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return {
                    success: false,
                    statusCode: 401,
                    responseBody: '',
                    errors: 'No access token found',
                    timestamp: new Date().toISOString(),
                    data: {
                        clients: [],
                        currentPage: 1,
                        pageSize: 10,
                        totalCount: 0,
                        totalPages: 0
                    }
                };
            }
            
            // Build query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...(searchTerm && { searchTerm: searchTerm })  // ✅ Changed 'search' to 'searchTerm'
            });
            
            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.LIST)}?${queryParams}`;
            console.log('API call URL:', url);
            console.log('Search term being sent:', searchTerm);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            
            const data = await response.json();
            console.log("user data fetch", data);
            
            // Return the full response with pagination info
            if (data.success && data.data) {
                return data as ClientsResponse;
            }
            
            return {
                success: false,
                statusCode: response.status,
                responseBody: '',
                errors: 'Invalid response format',
                timestamp: new Date().toISOString(),
                data: {
                    clients: [],
                    currentPage: 1,
                    pageSize: 10,
                    totalCount: 0,
                    totalPages: 0
                }
            };
        } catch (error) {
            console.error('Error fetching clients:', error);
            return {
                success: false,
                statusCode: 500,
                responseBody: '',
                errors: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
                data: {
                    clients: [],
                    currentPage: 1,
                    pageSize: 10,
                    totalCount: 0,
                    totalPages: 0
                }
            };
        }
    }

    static async createClient(formData: FormData): Promise<{ success: boolean; message: string }> {
        const formDataObject = Object.fromEntries(formData.entries());
        console.log('FormData as JSON:', JSON.stringify(formDataObject, null, 2));
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            console.log('This is data on profile picture:', formData.get('profile_picture'));
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.CREATE)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const formDataObject = Object.fromEntries(formData.entries());
            console.log('Form data as object:', formDataObject);
            const data = await response.json();
            console.log('collect error ',data)
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to create client' 
                };
            }
            
            return {
                success: true,
                message: 'Client created successfully'
            };
            
        } catch (error) {
            console.error('Error creating client:', error);
            return {
                success: false,
                message: 'An error occurred while creating the client'
            };
        }
    }

    static async updateClient(formData: FormData, clientId: number): Promise<{ success: boolean; message: string }> {

        const formDataObject = Object.fromEntries(formData.entries());
        console.log('FormData as JSON:', JSON.stringify(formDataObject, null, 2));
        
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                return {
                    success: false,
                    message: 'No token was found'
                }
            }
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.UPDATE)}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            // console.log('Response data: ', response.json());

            const data = await response.json();
            console.log("success data ",data.success)
            if (!data.success) {
                return {
                    success: false,
                    message: data.message || 'Failed to update client',
                }
            }
            return {
                success: true,
                message: 'Client updated successfully'
            }
        } catch (error) {
            return {
                success: false,
                message: 'An error occurred while updating the client',
            }
        }
    }
    
    static async getClientById(id: string): Promise<SelectedClientType | null> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return null;
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch client details');
            }
            
            const data = await response.json();
            console.log("selected client main", data.success);
            if (data.success && data.data) {
                return data.data;
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching client details:', error);
            return null;
        }
    }
    
    // static async approveClient(id: number): Promise<boolean> {
    //     try {
    //         const token = localStorage.getItem('access_token');
            
    //         if (!token) {
    //             console.error('No access token found');
    //             return false;
    //         }
            
    //         const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.APPROVE.replace(':id', id.toString())), {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         });
            
    //         if (!response.ok) {
    //             throw new Error('Failed to approve client');
    //         }
            
    //         const data = await response.json();
            
    //         return data.success === true;
    //     } catch (error) {
    //         console.error('Error approving client:', error);
    //         return false;
    //     }
    // }

    //statistic
    static async getClientStatistics(id: string): Promise<ClientStatisticsResponse | null> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return null;
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${id}/statistics`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch client statistics');
            }
            
            const data = await response.json();
            console.log("client statistics data", data);
            
            if (data.success && data.data) {
                return data as ClientStatisticsResponse;
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching client statistics:', error);
            return null;
        }
    }

    // Client Charges
    static async getClientCharges(clientId: string): Promise<ClientChargesResponse | null> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return null;
            }
            
            const response = await fetch(`${getApiUrl('Client/clients')}/${clientId}/charges`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch client charges');
            }
            
            const data = await response.json();
            return data as ClientChargesResponse;
        } catch (error) {
            console.error('Error fetching client charges:', error);
            return null;
        }
    }

    static async updateClientCharges(clientId: string, charges: ClientChargesUpdateRequest): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(`${getApiUrl('Client/clients')}/${clientId}/charges`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(charges)
            });
        
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to update client charges' 
                };
            }
            
            return {
                success: true,
                message: 'Client charges updated successfully'
            };
        } catch (error) {
            console.error('Error updating client charges:', error);
            return {
                success: false,
                message: 'An error occurred while updating client charges'
            };
        }
    }

    // Custom Fields
    static async getClientCustomFields(clientId: string): Promise<ClientCustomFieldsResponse | null> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return null;
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${clientId}/custom-fields`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch client custom fields');
            }
            
            const data = await response.json();
            return data as ClientCustomFieldsResponse;
        } catch (error) {
            console.error('Error fetching client custom fields:', error);
            return null;
        }
    }

    static async updateClientCustomFields(clientId: string, customFields: ClientCustomFieldsUpdateRequest): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${clientId}/custom-fields`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customFields)
            });
        
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to update client custom fields' 
                };
            }
            
            return {
                success: true,
                message: 'Client custom fields updated successfully'
            };
        } catch (error) {
            console.error('Error updating client custom fields:', error);
            return {
                success: false,
                message: 'An error occurred while updating client custom fields'
            };
        }
    }
    
    // Client Contacts Services
    static async getClientContacts(clientId: string): Promise<ClientContactsResponse | null> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return null;
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${clientId}/contacts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch client contacts');
            }
            
            const data = await response.json();
            return data as ClientContactsResponse;
        } catch (error) {
            console.error('Error fetching client contacts:', error);
            return null;
        }
    }
    
    static async createClientContact(clientId: string, contactData: ClientContactCreateRequest): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${clientId}/contacts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to create contact' 
                };
            }
            
            return {
                success: true,
                message: 'Contact created successfully'
            };
        } catch (error) {
            console.error('Error creating client contact:', error);
            return {
                success: false,
                message: 'An error occurred while creating contact'
            };
        }
    }
    
    static async updateClientContact(clientId: string, contactId: string, contactData: ClientContactUpdateRequest): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${clientId}/contacts/${contactId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to update contact' 
                };
            }
            
            return {
                success: true,
                message: 'Contact updated successfully'
            };
        } catch (error) {
            console.error('Error updating client contact:', error);
            return {
                success: false,
                message: 'An error occurred while updating contact'
            };
        }
    }
    
    static async deleteClientContact(clientId: string, contactId: string): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return { success: false, message: 'No access token found' };
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS)}/${clientId}/contacts/${contactId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { 
                    success: false, 
                    message: data.message || 'Failed to delete contact' 
                };
            }
            
            return {
                success: true,
                message: 'Contact deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting client contact:', error);
            return {
                success: false,
                message: 'An error occurred while deleting contact'
            };
        }
    }
}