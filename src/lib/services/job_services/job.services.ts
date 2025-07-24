import { getApiUrl, API_CONFIG } from '$lib/services/api';
import type { BookJob, CandidatesResponse, DayTimesheet, InternalJobCreateRequest, InternalJobsResponse, InternalJobUpdateRequest, JobData,JobResponse, PermanentJobCreateRequest, PermanentJobsResponse, WeeklyTimesheetAPI, WeeklyTimesheetCreateRequest, WeeklyTimesheetsResponse } from './job.type';



export const JobService = {

  

    //create job
    async createJob(job: JobData, clientId: string) {
        const url = getApiUrl(`${API_CONFIG.ENDPOINTS.JOBS.CREATE}?clientId=${clientId}`);
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
    async updateJob(jobId: number, job: JobData, clientId: string) {
        const url = getApiUrl(`${API_CONFIG.ENDPOINTS.JOBS.UPDATE}/${jobId}?clientId=${clientId}`);
        const token = localStorage.getItem('access_token');
        console.log('Request Payload:', job);
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(job)
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
},

async createPermanentJob(job: PermanentJobCreateRequest) {
    const url = getApiUrl('Job');
    const token = localStorage.getItem('access_token');
    console.log('Creating Permanent Job:', job);
    
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

async getPermanentJobs(page: number = 1, pageSize: number = 10, clientId?: string, search?: string): Promise<PermanentJobsResponse> {
    let url = `Job/my-jobs?page=${page}&pageSize=${pageSize}`;
    
    // Add clientId parameter if provided
    if (clientId) {
        url += `&clientId=${encodeURIComponent(clientId)}`;
    }
    
    // Add search parameter if provided (without trimming)
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }

    console.log(url)
    
    const fullUrl = getApiUrl(url);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch permanent jobs');
        }

        const data: PermanentJobsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching permanent jobs:', error);
        throw error;
    }
},

async createInternalJob(job: InternalJobCreateRequest, clientId: string) {
    const url = getApiUrl(`internal-jobs/clients/${clientId}`);
    const token = localStorage.getItem('access_token');
    console.log('Creating Internal Job:', job);
    
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

async getInternalJobs(clientId: string, page: number = 1, pageSize: number = 10, searchTerm?: string): Promise<InternalJobsResponse> {
    let url = `internal-jobs/clients/${clientId}?page=${page}&pageSize=${pageSize}`;
    
    // Add search parameter for companyName or general search
    if (searchTerm && searchTerm.trim()) {
        url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    
    const fullUrl = getApiUrl(url);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch internal jobs');
        }

        const data: InternalJobsResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching internal jobs:', error);
        throw error;
    }
},

async getAllInternalJobs(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string
): Promise<InternalJobsResponse> {
    let url = `internal-jobs?page=${page}&pageSize=${pageSize}`;
    
    // Add search parameter if provided
    if (searchTerm && searchTerm.trim()) {
        url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    
    const fullUrl = getApiUrl(url);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    try {
        console.log('Fetching internal jobs from URL:', fullUrl);
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            throw new Error('Failed to fetch internal jobs');
        }

        const apiResponse = await response.json();
        console.log('Incoming response data:', JSON.stringify(apiResponse, null, 2));
        
        // Transform the API response to match the expected InternalJobsResponse format
        const transformedResponse: InternalJobsResponse = {
            success: true,
            statusCode: 200,
            responseBody: 'Success',
            errors: '',
            timestamp: new Date().toISOString(),
            data: {
                jobs: apiResponse.jobs || [],
                currentPage: page,
                pageSize: pageSize,
                // Fix: Use the actual total count from API response
                totalCount: apiResponse.totalCount || apiResponse.total || 0,
                totalPages: Math.ceil((apiResponse.totalCount || apiResponse.total || 0) / pageSize)
            }
        };
        
        console.log('Transformed response:', transformedResponse);
        return transformedResponse;
    } catch (error) {
        console.error('Error fetching all internal jobs:', error);
        throw error;
    }
},
async updateInternalJob(jobId: string, job: InternalJobUpdateRequest) {
    const url = getApiUrl(`internal-jobs/${jobId}`);
    const token = localStorage.getItem('access_token');
    console.log('Updating Internal Job:', job);
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
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

async deleteInternalJob(jobId: string) {
    const url = getApiUrl(`internal-jobs/${jobId}`);
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (response.status === 200 || response.status === 204) {
            return data;
        }
        
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
},



// Weekly Timesheet Services
async createWeeklyTimesheet(
    jobId: string,
    candidateId: string,
    timesheetData: WeeklyTimesheetCreateRequest
): Promise<WeeklyTimesheetAPI> {
    const url = getApiUrl(`internal-jobs/${jobId}/candidates/${candidateId}/timesheets/weekly`);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }
    
    try {
        // Format TimeSpan values before sending - only for existing days
        const formattedData: any = {
            weekStartDate: timesheetData.weekStartDate
        };
        
        // Only format days that exist in the timesheet data
        const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        dayKeys.forEach(dayKey => {
            if (timesheetData[dayKey]) {
                formattedData[dayKey] = formatDayTimesheet(timesheetData[dayKey]);
            }
        });

        console.log('Sending timesheet data:', JSON.stringify(formattedData, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formattedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(`API Error (${response.status}): ${errorData.message || 'Unknown error occurred'}`);
        }
console.log('Response data:', await response.clone().json());
        const data = await response.json();
        console.log('Response data:', data);
        
        return data.data || data;
    } catch (error) {
        console.error('Error creating weekly timesheet:', error);
        throw error;
    }
},

async getWeeklyTimesheets(
    page: number = 1,
    pageSize: number = 10,
    weeklyStatus: 'pending' | 'completed' = 'pending'
): Promise<WeeklyTimesheetsResponse> {
    const url = getApiUrl(`internal-jobs/weekly-timesheets?page=${page}&pageSize=${pageSize}&weeklyStatus=${weeklyStatus}`);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Print response details for debugging
        console.log('Weekly Timesheets Response Status:', response.status);
        console.log('Weekly Timesheets Response Headers:', response.headers);
        
        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            throw new Error('Failed to fetch weekly timesheets');
        }

        const data: WeeklyTimesheetsResponse = await response.json();
        console.log('Weekly Timesheets Response Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching weekly timesheets:', error);
        throw error;
    }
},

async updateWeeklyTimesheetStatus(
    jobId: string,
    candidateId: string,
    weeklyTimesheetId: string,
    status: string
): Promise<any> {
    const url = getApiUrl(`internal-jobs/${jobId}/candidates/${candidateId}/timesheets/weekly/${weeklyTimesheetId}/status`);
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        
        if (response.status === 200 || response.status === 201) {
            return data.data || data;
        }
        
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
},

async deleteWeeklyTimesheet(
    jobId: string,
    userId: string,
    weeklyTimesheetId: string
): Promise<any> {
    const url = getApiUrl(`internal-jobs/${jobId}/users/${userId}/weekly-timesheets/${weeklyTimesheetId}`);
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Delete Weekly Timesheet Response Status:', response.status);

        if (response.status === 200 || response.status === 204) {
            const data = await response.json().catch(() => ({})); // Handle empty response
            return data;
        }
        
        const data = await response.json();
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
},

async deleteDayTimesheet(
    jobId: string,
    candidateId: string,
    dayTimesheetId: string
): Promise<any> {
    const url = getApiUrl(`internal-jobs/${jobId}/candidates/${candidateId}/timesheets/days/${dayTimesheetId}`);
    const token = localStorage.getItem('access_token');
    
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response data:', await response.clone().json());

        if (response.status === 200 || response.status === 204) {
            const data = await response.json().catch(() => ({})); // Handle empty response
            return data;
        }
        
        const data = await response.json();
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
},

async updateDayTimesheet(
    jobId: string,
    candidateId: string,
    dayTimesheetId: string,
    dayData: DayTimesheet
): Promise<DayTimesheet> {
    const url = getApiUrl(`internal-jobs/${jobId}/candidates/${candidateId}/timesheets/days/${dayTimesheetId}`);
    const token = localStorage.getItem('access_token');
    console.log(dayData)
    try {
        // Format time fields to handle both ISO 8601 and HH:MM formats
        const formatTimeToHHMMSS = (time: string): string => {
            if (!time) return '00:00:00';
            
            // Check if it's an ISO 8601 format (contains 'T')
            if (time.includes('T')) {
                const date = new Date(time);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
            }
            
            // Handle HH:MM or HH:MM:SS format
            const parts = time.split(':');
            if (parts.length === 2) {
                return `${time}:00`; // Convert HH:MM to HH:MM:SS
            }
            if (parts.length === 3) {
                return time; // Already in HH:MM:SS format
            }
            return '00:00:00'; // Fallback
        };
        
        // Format workDate to YYYY-MM-DD if it's in ISO format
        const formatWorkDate = (dateStr: string): string => {
            if (!dateStr) return new Date().toISOString().split('T')[0];
            
            if (dateStr.includes('T')) {
                return dateStr.split('T')[0]; // Extract YYYY-MM-DD from ISO format
            }
            return dateStr; // Assume it's already in YYYY-MM-DD format
        };
        
        // Convert to PascalCase format as expected by the backend
        const requestBody = {
            WorkDate: formatWorkDate(dayData.workDate),
            Start: formatTimeToHHMMSS(dayData.start),
            Finish: formatTimeToHHMMSS(dayData.finish),
            Break: formatTimeToHHMMSS(dayData.break),
            Expense: dayData.expense || null,
            Miles: dayData.miles || null,
            Rating: dayData.rating || null,
            Notes: dayData.notes || '',
            Status: (dayData as any).status || 'pending' // Handle status field
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        console.log('Response data:', await response.clone().json());
        const data = await response.json();
        
        if (response.status === 200 || response.status === 201) {
            return data.data || data;
        }
        
        throw new Error(`API Error: ${data.message || 'Unknown error occurred'}`);
    } catch (error) {
        console.error('Network/API Error:', error);
        throw error;
    }
},

// Candidate Services
async getCandidates(
    page: number = 1,
    pageSize: number = 10
): Promise<CandidatesResponse> {
    const url = getApiUrl(`admin/users?page=${page}&pageSize=${pageSize}`);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        throw new Error('No access token found');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch candidates');
        }

        const data: CandidatesResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candidates:', error);
        throw error;
    }
},

};


// Helper function to format day timesheet data
function formatDayTimesheet(dayData: DayTimesheet): DayTimesheet {
    if (!dayData) {
        throw new Error('Day timesheet data is required');
    }
    
    return {
        ...dayData,
        start: formatTimeString(dayData.start),
        finish: formatTimeString(dayData.finish),
        break: formatTimeString(dayData.break)
    };
}
// Helper function to format time strings
function formatTimeString(timeValue: string): string {
    if (typeof timeValue === 'string') {
        // Ensure format is HH:MM:SS
        const parts = timeValue.split(':');
        if (parts.length === 2) {
            // Convert HH:MM to HH:MM:SS
            return `${timeValue}:00`;
        }
        if (parts.length === 3) {
            return timeValue;
        }
    }
    return timeValue;
}

