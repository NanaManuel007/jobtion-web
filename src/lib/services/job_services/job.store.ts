import { writable } from 'svelte/store';
import { JobService } from './job.services';
import type { BookJob, JobData, JobResponse } from './job.type';

export const jobs = writable<JobResponse[]>([]);
export const isJobsLoading = writable(false);
export const bookingError = writable<string | null>(null);


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
    


    async addJob(job: JobData) {
        await JobService.createJob(job);
        await jobActions.getAllJobs(job.company_id);
    },

    async updateJob(jobId: number, job: JobData) {
        await JobService.updateJob(jobId, job);
        await jobActions.getAllJobs(job.company_id);
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
    }

    //interview store 
};