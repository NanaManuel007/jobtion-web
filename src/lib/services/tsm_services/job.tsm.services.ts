import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { ReportRequestBody, ReportResponse, TimesheetEntry, TSM, TSMUpdatePayload, InvoiceEntry, InvoiceResponse, PaginationParams, PaginatedInvoiceResponse, PayslipResponse, PayslipPaginationParams, ClientInvoicePaginationParams, PaginatedClientInvoiceResponse, ClientInvoiceResponse } from './job.tsm.types';

export class TSMService {
    static async getAllTSMs(): Promise<TSM[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TSM.LIST), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                // credentials: 'include'
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch TSMs');
            }
            
            const data = await response.json();
            console.log(data.success)
            if (data.success && Array.isArray(data.data)) {
                return data.data as TSM[];
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching TSMs:', error);
            return [];
        }
    }

    static async updateTSM(payload: any): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return false;
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TSM.UPDATE), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update TSM');
            }
            
            const data = await response.json();
            
            return data.success === true;
        } catch (error) {
            console.error('Error updating TSM:', error);
            return false;
        }
    }



    static async approveTSM(id: number): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return false;
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TSM.APPROVE), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tsm_id: id })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update TSM');
            }
            
            const data = await response.json();
            
            return data.success === true;
        } catch (error) {
            console.error('Error updating TSM:', error);
            return false;
        }
    }

    static async declineTSM(id: number): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return false;
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TSM.REJECT), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tsm_id: id })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update TSM');
            }
            
            const data = await response.json();
            
            return data.success === true;
        } catch (error) {
            console.error('Error updating TSM:', error);
            return false;
        }
    }

    // get report 
    // Updated getReport method to support pagination
    static async getReport(params: PaginationParams = {}): Promise<PaginatedInvoiceResponse> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return {
                    invoices: [],
                    pagination: {
                        totalCount: 0,
                        page: 1,
                        pageSize: 10,
                        totalPages: 0
                    }
                };
            }
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.fromDate) queryParams.append('fromDate', params.fromDate);
            if (params.toDate) queryParams.append('toDate', params.toDate);
            // Add isInvoiceGeneratedToClient parameter with default value of false
            const isInvoiceGenerated = params.isInvoiceGeneratedToClient ?? false;
            queryParams.append('isInvoiceGeneratedToClient', isInvoiceGenerated.toString());
            
            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.REPORTS.GENERAL)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch report');
            }
            
            const data: InvoiceResponse = await response.json();
            
            if (data.success && Array.isArray(data.data.invoices)) {
                return {
                    invoices: data.data.invoices as InvoiceEntry[],
                    pagination: {
                        totalCount: data.data.totalCount,
                        page: data.data.page,
                        pageSize: data.data.pageSize,
                        totalPages: data.data.totalPages
                    }
                };
            }
            
            return {
                invoices: [],
                pagination: {
                    totalCount: 0,
                    page: 1,
                    pageSize: 10,
                    totalPages: 0
                }
            };
        } catch (error) {
            console.error('Error fetching report:', error);
            return {
                invoices: [],
                pagination: {
                    totalCount: 0,
                    page: 1,
                    pageSize: 10,
                    totalPages: 0
                }
            };
        }
    }

    //fetch report summary with date 
    static async fetchReportSummary(requestBody: ReportRequestBody): Promise<ReportResponse> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                throw new Error('No access token found');
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REPORTS.GENERATEREPORT), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody),
                mode: 'cors',
                // credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch report summary');
            }
            
            const data = await response.json();
            return data as ReportResponse;
            
        } catch (error) {
            console.error('Error fetching report summary:', error);
            throw error;
        }
    }

    //generate payslip
    static async generatePayslip(fromDate: string, toDate: string): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                throw new Error('No access token found');
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REPORTS.GENERATEPAYSLIP), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ fromDate, toDate }),
                mode: 'cors',
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate payslip');
            }
            
            const data = await response.json();
            
            // Print the response data
            console.log('Generate Payslip Response:', data);
            console.log('Response Structure:', {
                success: data.success,
                statusCode: data.statusCode,
                responseBody: data.responseBody,
                errors: data.errors,
                timestamp: data.timestamp,
                data: data.data
            });
            
            return data.success === true;
        } catch (error) {
            console.error('Error generating payslip:', error);
            return false;
        }
    }

    // Get candidate payslips
    static async getCandidatePayslips(params: PayslipPaginationParams = {}): Promise<PayslipResponse> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                throw new Error('No access token found');
            }
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.fromDate) queryParams.append('fromDate', params.fromDate);
            if (params.toDate) queryParams.append('toDate', params.toDate);
            
            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.REPORTS.CANDIDATE_PAYSLIPS)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch candidate payslips');
            }
            
            const data: PayslipResponse = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching candidate payslips:', error);
            throw error;
        }
    }

    static async getClientInvoices(params: ClientInvoicePaginationParams = {}): Promise<PaginatedClientInvoiceResponse> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return {
                    clientInvoices: [],
                    pagination: {
                        totalCount: 0,
                        pageNumber: 1,
                        pageSize: 10
                    }
                };
            }
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.fromDate) queryParams.append('fromDate', params.fromDate);
            if (params.toDate) queryParams.append('toDate', params.toDate);
            
            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.REPORTS.CLIENT_INVOICES)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch client invoices');
            }
            
            const data: ClientInvoiceResponse = await response.json();
            
            if (data.success && Array.isArray(data.data.clientInvoices)) {
                return {
                    clientInvoices: data.data.clientInvoices,
                    pagination: {
                        totalCount: data.data.totalCount,
                        pageNumber: data.data.pageNumber,
                        pageSize: data.data.pageSize
                    }
                };
            }
            
            return {
                clientInvoices: [],
                pagination: {
                    totalCount: 0,
                    pageNumber: 1,
                    pageSize: 10
                }
            };
        } catch (error) {
            console.error('Error fetching client invoices:', error);
            return {
                clientInvoices: [],
                pagination: {
                    totalCount: 0,
                    pageNumber: 1,
                    pageSize: 10
                }
            };
        }
    }
}