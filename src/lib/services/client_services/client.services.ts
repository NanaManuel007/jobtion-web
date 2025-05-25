import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { ClientsType, ClientListResponse, SelectedClientType } from './client.type';

export class ClientService {
    static async getAllClients(): Promise<ClientsType[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.LIST)}`, {
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
            console.log("user data  fetch", data.data)
            if (data.success && Array.isArray(data.data)) {
                return data.data;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching clients:', error);
            return [];
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
    
    static async getClientById(id: number): Promise<SelectedClientType | null> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return null;
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.DETAILS), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

           
        
            if (!response.ok) {
                throw new Error('Failed to fetch client details');
            }
            
            const data = await response.json();
            console.log("selected client main",data.success)
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
}