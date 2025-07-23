import { getApiUrl, API_CONFIG } from '../api';
import type { Candidate, CandidateListResponse, CandidateQueryParams, DetailedCandidateResponse, DetailedCandidate, BankDetails, PaymentModel } from './candidate.types';

export class CandidateService {
    static async getAllCandidates(params: CandidateQueryParams = {}): Promise<CandidateListResponse> {
        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                console.error('No access token found');
                throw new Error('No access token found');
            }

            // Build query parameters
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
            if (params.userType) queryParams.append('userType', params.userType);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.isAdminVerified !== undefined) queryParams.append('isAdminVerified', params.isAdminVerified.toString());
            if (params.isEmailVerified !== undefined) queryParams.append('isEmailVerified', params.isEmailVerified.toString());

            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.CANDIDATES.LIST)}?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch candidates');
            }

            const data: CandidateListResponse = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.responseBody || 'Failed to fetch candidates');
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            throw error;
        }
    }

    // Helper method to get only candidates (filter by userType)
    static async getCandidatesOnly(params: CandidateQueryParams = {}): Promise<CandidateListResponse> {
        return this.getAllCandidates({ ...params, userType: 'candidate' });
    }

    // Get single candidate by ID
    static async getSingleCandidate(userId: string): Promise<{ success: boolean; data?: DetailedCandidate; message?: string }> {
        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/users/${userId}`)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch candidate');
            }

            const data: DetailedCandidateResponse = await response.json();

            if (data.success) {
                return { success: true, data: data.data };
            } else {
                throw new Error(data.responseBody || 'Failed to fetch candidate');
            }
        } catch (error) {
            console.error('Error fetching single candidate:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch candidate'
            };
        }
    }

    // Admin verification method
    static async verifyCandidate(userId: string, isAdminVerified: boolean): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/users/${userId}/verification`)}`;

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isAdminVerified
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update candidate verification');
            }

            const data = await response.json();

            if (data.success) {
                return { success: true, message: 'Candidate verification updated successfully' };
            } else {
                throw new Error(data.responseBody || 'Failed to update candidate verification');
            }
        } catch (error) {
            console.error('Error updating candidate verification:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to verify candidate'
            };
        }
    }

    // Bank Details API methods
    static async createBankDetails(userId: string, bankDetails: Partial<BankDetails>): Promise<{ success: boolean; message: string; data?: BankDetails }> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/bank-details/user/${userId}`)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bankDetails)
            });

            if (!response.ok) {
                throw new Error('Failed to create bank details');
            }

            const data = await response.json();
            return { success: true, message: 'Bank details created successfully', data: data.data };
        } catch (error) {
            console.error('Error creating bank details:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create bank details'
            };
        }
    }

    static async updateBankDetails(userId: string, bankDetails: Partial<BankDetails>): Promise<{ success: boolean; message: string; data?: BankDetails }> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/bank-details/user/${userId}`)}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bankDetails)
            });

            if (!response.ok) {
                throw new Error('Failed to update bank details');
            }

            const data = await response.json();
            return { success: true, message: 'Bank details updated successfully', data: data.data };
        } catch (error) {
            console.error('Error updating bank details:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update bank details'
            };
        }
    }

    // Payment Model API methods
    static async createPaymentModel(userId: string, paymentModel: Partial<PaymentModel>): Promise<{ success: boolean; message: string; data?: PaymentModel }> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/bank-details/payment-model`)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    paymentModel
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment model');
            }

            const data = await response.json();
            return { success: true, message: 'Payment model created successfully', data: data.data };
        } catch (error) {
            console.error('Error creating payment model:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create payment model'
            };
        }
    }

    static async updatePaymentModel(userId: string, paymentModel: Partial<PaymentModel>): Promise<{ success: boolean; message: string; data?: PaymentModel }> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/bank-details/payment-model/user/${userId}`)}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentModel)
            });

            if (!response.ok) {
                throw new Error('Failed to update payment model');
            }

            const data = await response.json();
            return { success: true, message: 'Payment model updated successfully', data: data.data };
        } catch (error) {
            console.error('Error updating payment model:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update payment model'
            };
        }
    }

    // Bank Details Verification method
    static async verifyBankDetails(userId: string, isVerified: boolean): Promise<{ success: boolean; message: string; data?: BankDetails }> {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No access token found');
            }

            const url = `${getApiUrl(`admin/bank-details/user/${userId}/verify`)}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isVerified })
            });

            if (!response.ok) {
                throw new Error('Failed to update bank details verification');
            }

            const data = await response.json();
            return { 
                success: true, 
                message: `Bank details ${isVerified ? 'verified' : 'unverified'} successfully`, 
                data: data.data 
            };
        } catch (error) {
            console.error('Error updating bank details verification:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update bank details verification'
            };
        }
    }
}
