// services 
import type { Application, ApplicationListResponse, ApplicationQueryParams } from './application.types';
import { API_CONFIG, getApiUrl } from '../api';

export class ApplicationService {
    static async getAllApplications(params: ApplicationQueryParams = {}): Promise<ApplicationListResponse> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                throw new Error('No access token found');
            }
            
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
            
            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.JOBS.GETAPPLICATIONS)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }
            
            const data = await response.json();
            console.log("applications data fetch", data);
            
            return data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    //accept application
    static async acceptApplication(applicationId: number): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return false;
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.JOBS.APPROVEAPPLICATION), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: applicationId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to accept application');
            }
            
            const data = await response.json();
            console.log(data)
            return data.success || false;

        } catch (error) {
            console.error('Error accepting application:', error);
            return false;
        }
    }

    static async declineApplication(applicationId: number): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return false;
            }
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.JOBS.DECLINEAPPLICATION), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: applicationId
                })
            });
            console.log(applicationId)
     
            if (!response.ok) {
                const data = await response.json();
                console.log("declined status for review ",data)
                throw new Error('Failed to accept application');
                
            }
            
            const data = await response.json();
            console.log("declined status for review ",data)

            return data.success || false;

        } catch (error) {
            console.error('Error accepting application:', error);
            return false;
        }
    }


    //interviews
    static async setInterview(applicationId: number, interviewDetails: { interview_date: string, interview_time: string, interview_by: string, interview_link: string }): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return false;
            }

            console.log(interviewDetails)
            
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.JOBS.SETINTVERVIEW), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    application_id: applicationId,
                    ...interviewDetails
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error('Failed to set interview');
            }
            
            const data = await response.json();
            return data.success || false;

        } catch (error) {
            console.error('Error setting interview:', error);
            return false;
        }
    }
}