import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { ReportRequestBody, ReportResponse, TimesheetEntry, TSM, TSMUpdatePayload } from './job.tsm.types';

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
                credentials: 'include'
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
    static async getReport(): Promise<TimesheetEntry[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REPORTS.GENERAL), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch report');
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                // console.log(data)
                return data.data as TimesheetEntry[];
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching report:', error);
            return [];
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
                credentials: 'include'
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
    static async generatePayslip(requestBody: ReportRequestBody): Promise<boolean> {
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
                body: JSON.stringify(requestBody),
                mode: 'cors',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate payslip');
            }
            
            const data = await response.json();
            return data.success === true;
        } catch (error) {
            console.error('Error generating payslip:', error);
            return false;
        }
    }



}