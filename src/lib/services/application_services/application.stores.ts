import { writable } from 'svelte/store';
import type { Application } from './application.types';
import { ApplicationService } from './application.services';

interface ApplicationStore {
    applications: Application[];
    loading: boolean;
    error: string | null;
}

const createApplicationStore = () => {
    const initialState: ApplicationStore = {
        applications: [],
        loading: false,
        error: null
    };

    const { subscribe, set, update } = writable(initialState);

    const fetchApplications = async () => {
        update(state => ({ ...state, loading: true, error: null }));
        try {
            const applications = await ApplicationService.getAllApplications();
            set({ applications, loading: false, error: null });
        } catch (error) {
            update(state => ({
                ...state,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch applications'
            }));
        }
    };

    return {
        subscribe,
        fetchApplications,
        acceptApplication: async (applicationId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const success = await ApplicationService.acceptApplication(applicationId);
                if (success) {
                    await fetchApplications();
                } else {
                    throw new Error('Failed to accept application');
                }
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to accept application'
                }));
            }
        },
        declineApplication: async (applicationId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const success = await ApplicationService.declineApplication(applicationId);
                if (success) {
                    await fetchApplications();
                } else {
                    throw new Error('Failed to decline application');
                }
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to decline application'
                }));
            }
        },
        setInterview: async (applicationId: number, interviewDetails: { interview_date: string, interview_time: string, interview_by: string, interview_link: string }) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const success = await ApplicationService.setInterview(applicationId, interviewDetails);
                if (success) {
                    await fetchApplications();
                } else {
                    throw new Error('Failed to set interview');
                }
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to set interview'
                }));
            }
        },
        //update interview
        reset: () => set(initialState)
    };
};

export const applicationStore = createApplicationStore();