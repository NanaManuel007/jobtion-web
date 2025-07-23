import { writable } from 'svelte/store';
import { JobService } from './job.services';
import type { BookJob, InternalJobAPI, InternalJobCreateRequest, InternalJobUpdateRequest, JobData, JobResponse, PermanentJobAPI, PermanentJobCreateRequest } from './job.type';

export const jobs = writable<JobResponse[]>([]);
export const isJobsLoading = writable(false);
export const bookingError = writable<string | null>(null);

// Add permanent jobs stores
export const permanentJobs = writable<PermanentJobAPI[]>([]);
export const isPermanentJobsLoading = writable(false);
export const permanentJobsPagination = writable({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
});

// Add internal jobs stores
export const internalJobs = writable<InternalJobAPI[]>([]);
export const isInternalJobsLoading = writable(false);
export const internalJobsPagination = writable({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
});

export const jobActions = {
    // async getAllJobs() {
    //     isJobsLoading.set(true);
    //     try {
    //         const data = await JobService.getAllJobs();
    //         jobs.set(data);
    //     } catch (error) {
    //         console.error('Failed to refresh jobs:', error);
    //     } finally {
    //         isJobsLoading.set(false);
    //     }
    // },
    async getAllJobsWithoutClientId() {
        isJobsLoading.set(true);
        try {
            const data = await JobService.getAllJobsWithoutClientId();
            if (data) {
                jobs.set(data);
            }
        } catch (error) {
            console.error('Failed to refresh jobs:', error);
            jobs.set([]); // Set empty array on error
        } finally {
            isJobsLoading.set(false);
        }
    },
    async getAllJobs(clientId?: number) {
        isJobsLoading.set(true);
        try {
            const data = await JobService.getAllJobs(clientId);
            jobs.set(data);
        } catch (error) {
            console.error('Failed to refresh jobs:', error);
        } finally {
            isJobsLoading.set(false);
        }
    },
    


    async addJob(job: JobData, clientId: string) {
        await JobService.createJob(job, clientId);
        await jobActions.getPermanentJobs(1, 10, clientId);
    },

    async updateJob(jobId: number, job: JobData, clientId: string) {
        await JobService.updateJob(jobId, job, clientId);
        await jobActions.getPermanentJobs(1, 10, clientId);
    },
    async createBooking(booking: BookJob) {
        console.log(booking);
        isJobsLoading.set(true);
        bookingError.set(null);
        try {
            const result = await JobService.createBooking(booking);
            if (result && result.success) {
                return { success: true, data: result };
            }
            throw new Error(result?.message || 'Failed to create booking');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
            bookingError.set(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            isJobsLoading.set(false);
        }
    },
    async publishJob(jobId: number, publishStatus: number) {
        isJobsLoading.set(true);
        try {
            await JobService.publishJob({ id: jobId, publish: publishStatus });
            // Refresh the jobs list to reflect the updated status
            await jobActions.getAllJobs();
            return { success: true };
        } catch (error) {
            console.error('Failed to publish job:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        } finally {
            isJobsLoading.set(false);
        }
    },


    
    // Add permanent job actions following your pattern
    async getPermanentJobs(page: number = 1, pageSize: number = 10, clientId?: string, search?: string) {
        isPermanentJobsLoading.set(true);
        try {
            const response = await JobService.getPermanentJobs(page, pageSize, clientId, search);
            if (response && response.success) {
                permanentJobs.set(response.data.jobs);
                permanentJobsPagination.set({
                    currentPage: response.data.currentPage,
                    pageSize: response.data.pageSize,
                    totalCount: response.data.totalCount,
                    totalPages: response.data.totalPages
                });
            }
        } catch (error) {
            console.error('Failed to refresh permanent jobs:', error);
            permanentJobs.set([]);
        } finally {
            isPermanentJobsLoading.set(false);
        }
    },

    async addPermanentJob(job: PermanentJobCreateRequest) {
        await JobService.createPermanentJob(job);
        await jobActions.getPermanentJobs(1, 10, job.clientId);
    },

    async getInternalJobs(clientId: string, page: number = 1, pageSize: number = 10, searchTerm?: string) {
    isInternalJobsLoading.set(true);
    try {
        const response = await JobService.getInternalJobs(clientId, page, pageSize, searchTerm);
        if (response && response.success) {
            internalJobs.set(response.data.jobs);
            internalJobsPagination.set({
                currentPage: response.data.currentPage,
                pageSize: response.data.pageSize,
                totalCount: response.data.totalCount,
                totalPages: response.data.totalPages
            });
        }
    } catch (error) {
        console.error('Failed to refresh internal jobs:', error);
        internalJobs.set([]);
    } finally {
        isInternalJobsLoading.set(false);
    }
},

async addInternalJob(job: InternalJobCreateRequest, clientId: string) {
    await JobService.createInternalJob(job, clientId);
    await jobActions.getInternalJobs(clientId, 1, 10);
},

async updateInternalJob(jobId: string, job: InternalJobUpdateRequest, clientId: string) {
    await JobService.updateInternalJob(jobId, job);
    await jobActions.getInternalJobs(clientId, 1, 10);
},

async deleteInternalJob(jobId: string, clientId: string) {
    await JobService.deleteInternalJob(jobId);
    await jobActions.getInternalJobs(clientId, 1, 10);
}

    // async updatePermanentJob(jobId: string, job: PermanentJobCreateRequest) {
    //     await JobService.updatePermanentJob(jobId, job);
    //     await jobActions.getPermanentJobs(1, 10, job.clientId);
    // },

    // async publishPermanentJob(jobId: string, publishStatus: boolean) {
    //     isPermanentJobsLoading.set(true);
    //     try {
    //         await JobService.publishPermanentJob({ id: jobId, isPublished: publishStatus });
    //         // Refresh the permanent jobs list to reflect the updated status
    //         await jobActions.getPermanentJobs();
    //         return { success: true };
    //     } catch (error) {
    //         console.error('Failed to publish permanent job:', error);
    //         return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    //     } finally {
    //         isPermanentJobsLoading.set(false);
    //     }
    // }
};


// Updated internal job actions with search support
