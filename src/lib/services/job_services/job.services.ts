import { getApiUrl, API_CONFIG } from '$lib/services/api';
import type { BookJob, JobData,JobResponse } from './job.type';

export const JobService = {

  

    //create job
    async createJob(job: JobData) {
        const url = getApiUrl(API_CONFIG.ENDPOINTS.JOBS.CREATE);
        const token = localStorage.getItem('access_token');
        console.log('Request Payload:', job);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(job),
            });

            const data = await response.json();
            
            if (response.status === 200 || response.status === 201) {
                if (data.success) {
                    return data;
                }
            }
            
            throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
        } catch (error) {
            console.error('Network/API Error:', error);
            throw error;
        }
    },
    //update job by id
    async updateJob(jobId: number, job: JobData) {
        const url = getApiUrl(API_CONFIG.ENDPOINTS.JOBS.UPDATE);
        const token = localStorage.getItem('access_token');
        console.log(token)
        const payload = {
            id: jobId,
            ...job,
            ...(job.job_type === 'Temporary' && 'days_sessions' in job 
                ? { days_sessions: job.days_sessions } 
                : {})
        };
        console.log('Request Payload:', payload);
        
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (response.status === 200 || response.status === 201) {
                if (data.success) {
                    return data;
                }
            }
            
            throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
        } catch (error) {
            console.error('Network/API Error:', error);
            throw error;
        }
    },
  //get jobs
  async getAllJobs(clientId?: number): Promise<JobResponse[]> {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.JOBS.ALLPOSTEDJOBS);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
        console.log("client",data.data);
        if (clientId) {
            return data.data.filter((job:any )=> job.company_id === clientId);
        }
        return data.data;
    }

    return [];
},

async getAllJobsWithoutClientId(): Promise<JobResponse[]> {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.JOBS.ALLPOSTEDJOBS);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
        console.log("client",data.data);
        return data.data;
        // if (clientId) {
        //     return data.data.filter((job:any )=> job.company_id === clientId);
        // }
        return data.data;
    }

    return [];
},
// create bookings
async createBooking(booking: BookJob) {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.JOBS.CREATEBOOKING);
    const token = localStorage.getItem('access_token');
    
    try {
        const bookingData = {
            job_id: booking.jobId,      
            candidate_id: booking.candidateId  
        };
        console.log(bookingData);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData),
        });

        const data = await response.json();
        console.log(data)
        if (data.success) {
            if (data.success) {
                return data;
            }
        }
        
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
},

//publish job
async publishJob(jobData: { id: number, publish: number }) {
    const url = getApiUrl(API_CONFIG.ENDPOINTS.JOBS.PUBLISHJOB);
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData),
        });

        const data = await response.json();
        
        if (response.status === 200 || response.status === 201) {
            if (data.success) {
                return data;
            }
        }
        
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
}

//interview
};