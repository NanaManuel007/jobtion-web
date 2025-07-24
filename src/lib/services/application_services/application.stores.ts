import { writable } from 'svelte/store';
import type { Application, ApplicationQueryParams } from './application.types';
import { ApplicationService } from './application.services';

interface ApplicationStore {
    applications: Application[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
    filters: ApplicationQueryParams;
}

const createApplicationStore = () => {
    const initialState: ApplicationStore = {
        applications: [],
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0
        },
        filters: {}
    };

    const { subscribe, set, update } = writable(initialState);
    let currentState = initialState;

    // Keep track of current state
    subscribe(state => {
        currentState = state;
    });

    const fetchApplications = async (params?: ApplicationQueryParams) => {
        update(state => ({ ...state, loading: true, error: null }));
        try {
            const queryParams = { ...currentState.filters, ...params };
            const response = await ApplicationService.getAllApplications(queryParams);
            
            update(state => ({
                ...state,
                applications: response.data.applications,
                pagination: {
                    currentPage: response.data.currentPage,
                    pageSize: response.data.pageSize,
                    totalCount: response.data.totalCount,
                    totalPages: response.data.totalPages
                },
                filters: queryParams,
                loading: false,
                error: null
            }));
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
        // Pagination methods
        goToPage: async (page: number) => {
            fetchApplications({ page });
        },
        changePageSize: async (pageSize: number) => {
            fetchApplications({ pageSize, page: 1 });
        },
        searchApplications: async (search: string) => {
            fetchApplications({ search, page: 1 });
        },
        filterByStatus: async (status: string) => {
            fetchApplications({ status, page: 1 });
        },
        acceptApplication: async (applicationId: string, clientId: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const success = await ApplicationService.updateApplicationStatus(applicationId, clientId, 'accepted');
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
        declineApplication: async (applicationId: string, clientId: string, rejectionReason?: string) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const success = await ApplicationService.updateApplicationStatus(applicationId, clientId, 'rejected', rejectionReason);
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
        setInterview: async (applicationId: string, clientId:string, interviewDetails: { 
            interviewDate: string, 
            interviewTime: string, 
            interviewLocation: string,
            interviewInviteLink: string,
            interviewBy: string,
            interviewNotes: string 
        }) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const success = await ApplicationService.setInterview(applicationId,clientId, interviewDetails);
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
        reset: () => set(initialState)
    };
};

export const applicationStore = createApplicationStore();