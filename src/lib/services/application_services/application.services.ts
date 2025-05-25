// services 
import  type { Application } from './application.types';
import { API_CONFIG, getApiUrl } from '../api';

export class ApplicationService {
    static async getAllApplications(): Promise<Application[]> {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                console.error('No access token found');
                return [];
            }
            
            const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.JOBS.GETAPPLICATIONS)}`, {
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