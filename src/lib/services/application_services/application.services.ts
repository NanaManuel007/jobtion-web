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




    //interviews
    static async setInterview(applicationId: string, clientId:string, interviewDetails: { 
        interviewDate: string, 
        interviewTime: string, 
        interviewLocation: string,
        interviewInviteLink: string,
        interviewBy: string,
        interviewNotes: string 
    }): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');
          
            if (!token) {
                console.error('No access token found');
                return false;
            }
    
            console.log('=== INTERVIEW SUBMISSION DEBUG ===');
            console.log('Setting interview for application ID:', applicationId);

            console.log('Raw interview details received:', JSON.stringify(interviewDetails, null, 2));
            
            // Format the interview time as HH:mm:ss
            let formattedInterviewTime = interviewDetails.interviewTime;
            if (interviewDetails.interviewTime && !interviewDetails.interviewTime.includes(':')) {
                // If it's not in time format, handle accordingly
                formattedInterviewTime = interviewDetails.interviewTime;
            } else if (interviewDetails.interviewTime && interviewDetails.interviewTime.length === 5) {
                // If it's HH:mm format, add seconds
                formattedInterviewTime = `${interviewDetails.interviewTime}:00`;
            }
            
            console.log('Original interviewTime:', interviewDetails.interviewTime);
            console.log('Formatted interviewTime:', formattedInterviewTime);
            
            // Send data directly without 'request' wrapper
            const requestBody = {
                interviewDate: interviewDetails.interviewDate,
                interviewTime: formattedInterviewTime,
                interviewLocation: interviewDetails.interviewLocation,
                interviewInviteLink: interviewDetails.interviewInviteLink,
                interviewBy: interviewDetails.interviewBy,
                interviewNotes: interviewDetails.interviewNotes
            };
            
            console.log('=== FINAL REQUEST BODY ===');
            console.log('Complete request object:', JSON.stringify(requestBody, null, 2));
            console.log('Request body size:', JSON.stringify(requestBody).length, 'characters');
            
            // Check for empty required fields
            console.log('=== FIELD VALIDATION ===');
            console.log('interviewBy value:', `"${interviewDetails.interviewBy}"`);
            console.log('interviewBy length:', interviewDetails.interviewBy.length);
            console.log('interviewBy is empty:', interviewDetails.interviewBy.trim() === '');
            console.log('interviewLocation value:', `"${interviewDetails.interviewLocation}"`);
            console.log('interviewLocation length:', interviewDetails.interviewLocation.length);
            console.log('interviewLocation is empty:', interviewDetails.interviewLocation.trim() === '');
            
            // Add clientId to the URL
            const url = `${getApiUrl(`applications/${applicationId}/interview?clientId=${clientId}`)}`;
            console.log('Request URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('=== ERROR RESPONSE ===');
                console.error('Error response text:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    console.error('Parsed error data:', JSON.stringify(errorData, null, 2));
                    
                    if (errorData.errors) {
                        console.error('Validation errors:');
                        Object.entries(errorData.errors).forEach(([field, messages]) => {
                            console.error(`  ${field}:`, messages);
                        });
                    }
                } catch (parseError) {
                    console.error('Could not parse error response as JSON');
                }
                
                throw new Error(`Failed to set interview: ${response.status} ${response.statusText}`);
            }
            
            const responseText = await response.text();
            console.log('=== SUCCESS RESPONSE ===');
            console.log('Success response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Success response data:', JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.log('Response is not JSON, treating as success');
                return true;
            }
            
            return data.success !== false;
    
        } catch (error) {
            console.error('=== CATCH BLOCK ERROR ===');
            console.error('Error setting interview:', error);
            return false;
        }
    }

    // Update application status (accept/reject)
    static async updateApplicationStatus(
        applicationId: string, 
        clientId:string,
        status: 'accepted' | 'rejected', 
        rejectionReason?: string
    ): Promise<boolean> {
        try {
            const token = localStorage.getItem('access_token');

            
            if (!token) {
                console.error('No access token found');
                return false;
            }

            const requestBody: { status: string; rejectionReason?: string } = {
                status
            };

            if (rejectionReason) {
                requestBody.rejectionReason = rejectionReason;
            }

            console.log('Updating application status:', {
                applicationId,
                status,
                rejectionReason,
                clientId
            });
            // const url = `${getApiUrl(`applications/${applicationId}/interview?clientId=${clientId}`)}`;
            
            const url = `${getApiUrl(`applications/${applicationId}/status?clientId=${clientId}`)}`;
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update application status:', errorData);
                throw new Error(`Failed to ${status === 'accepted' ? 'accept' : 'reject'} application`);
            }
            
            const data = await response.json();
            console.log('Application status updated successfully:', data);
            return data.success || true;

        } catch (error) {
            console.error(`Error updating application status to ${status}:`, error);
            return false;
        }
    }

}