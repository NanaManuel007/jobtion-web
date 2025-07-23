
// import { writable } from 'svelte/store';
// import type { Candidate, Verification, CandidateQualification, CandidateReference, CandidateOtherDocument, AppliedJob, AvailabilitySchedule, Booking } from './candidate.type';
// import { CandidateService } from './candidate.services';

// function createCandidateStore() {
//     const { subscribe, set, update } = writable<{
//         candidates: Candidate[];
//         selectedCandidate: {
//             details: Candidate | null;
//             qualifications: CandidateQualification[];
//             references: CandidateReference[];
//             other_documents: CandidateOtherDocument[];
//             applied_jobs: AppliedJob[];
//             availability_schedule: AvailabilitySchedule;
//             bookings: Booking[];
//         };
//         loading: boolean;
//         error: string | null;
//     }>({
//         candidates: [],
//         selectedCandidate: {
//             details: null,
//             qualifications: [],
//             references: [],
//             other_documents: [],
//             applied_jobs: [],
//             availability_schedule: {
//                 Monday: [],
//                 Tuesday: [],
//                 Wednesday: [],
//                 Thursday: [],
//                 Friday: [],
//                 Saturday: [],
//                 Sunday: []
//             },
//             bookings: []
//         },
//         loading: false,
//         error: null
//     });

//     return {
//         subscribe,
        
//         // Fetch all candidates
//         async fetchCandidates() {
//             update(state => ({ ...state, loading: true, error: null }));
//             try {
//                 const candidates = await CandidateService.getAllCandidates();
//                 update(state => ({
//                     ...state,
//                     candidates,
//                     loading: false,
//                     error: null
//                 }));
//             } catch (error) {
//                 update(state => ({
//                     ...state,
//                     loading: false,
//                     error: error instanceof Error ? error.message : 'Failed to fetch candidates'
//                 }));
//             }
//         },       
//          async refreshCandidateData(id: number) {
//             update(state => ({ ...state, loading: true, error: null }));
//             try {
//                 const candidateDetails = await CandidateService.getCandidateById(id);
//                 if (candidateDetails) {
//                     update(state => ({
//                         ...state,
//                         selectedCandidate: {
//                             details: candidateDetails.details,
//                             qualifications: candidateDetails.qualifications,
//                             references: candidateDetails.references,
//                             other_documents: candidateDetails.other_documents,
//                             applied_jobs: candidateDetails.applied_jobs,
//                             availability_schedule: candidateDetails.availability_schedule,
//                             bookings: candidateDetails.bookings
//                         },
//                         loading: false,
//                         error: null
//                     }));
//                     return true;
//                 }
//                 return false;
//             } catch (error) {
//                 update(state => ({
//                     ...state,
//                     loading: false,
//                     error: error instanceof Error ? error.message : 'Failed to refresh candidate data'
//                 }));
//                 return false;
//             }
//         },

//         // Fetch single candidate
//         // async fetchCandidateById(id: number) {
//         //     update(state => ({ ...state, loading: true, error: null }));
//         //     try {
//         //         const candidateDetails = await CandidateService.getCandidateById(id);
//         //         if (candidateDetails) {
//         //             update(state => ({
//         //                 ...state,
//         //                 selectedCandidate: {
//         //                     details: candidateDetails.details,
//         //                     qualifications: candidateDetails.qualifications,
//         //                     references: candidateDetails.references,
//         //                     other_documents: candidateDetails.other_documents
//         //                 },
//         //                 loading: false,
//         //                 error: null
//         //             }));
//         //         }
//         //     } catch (error) {
//         //         update(state => ({
//         //             ...state,
//         //             loading: false,
//         //             error: error instanceof Error ? error.message : 'Failed to fetch candidate'
//         //         }));
//         //     }
//         // },

//         async fetchCandidateById(id: number) {
//             update(state => ({ ...state, loading: true, error: null }));
//             try {
//                 const candidateDetails = await CandidateService.getCandidateById(id);
//                 if (candidateDetails) {
//                     update(state => ({
//                         ...state,
//                         selectedCandidate: {
//                             details: candidateDetails.details,
//                             qualifications: candidateDetails.qualifications,
//                             references: candidateDetails.references,
//                             other_documents: candidateDetails.other_documents,
//                             applied_jobs: candidateDetails.applied_jobs,
//                             availability_schedule: candidateDetails.availability_schedule,
//                             bookings: candidateDetails.bookings
//                         },
//                         loading: false,
//                         error: null
//                     }));
//                 }
//             } catch (error) {
//                 update(state => ({
//                     ...state,
//                     loading: false,
//                     error: error instanceof Error ? error.message : 'Failed to fetch candidate'
//                 }));
//             }
//         },
//         async fetchCandidateByIdUpdateDate(id: number) {
//             update(state => ({ ...state, loading: false, error: null }));
//             try {
//                 const candidateDetails = await CandidateService.getCandidateById(id);
//                 if (candidateDetails) {
//                     update(state => ({
//                         ...state,
//                         selectedCandidate: {
//                             details: candidateDetails.details,
//                             qualifications: candidateDetails.qualifications,
//                             references: candidateDetails.references,
//                             other_documents: candidateDetails.other_documents,
//                             applied_jobs: candidateDetails.applied_jobs,
//                             availability_schedule: candidateDetails.availability_schedule,
//                             bookings: candidateDetails.bookings
//                         },
//                         loading: false,
//                         error: null
//                     }));
//                 }
//             } catch (error) {
//                 update(state => ({
//                     ...state,
//                     loading: false,
//                     error: error instanceof Error ? error.message : 'Failed to fetch candidate'
//                 }));
//             }
//         },
//         //user verification
//         async verifyCandidate(candidateId: number, verificationStatus: number) {
//             update(state => ({ ...state, loading: true, error: null }));
            
//             try {
//                 const verification: Verification = {
//                     id: candidateId,
//                     verification_status: verificationStatus
//                 };
                
//                 const result = await CandidateService.verifyCandidate(verification);
                
//                 if (result.success) {
//                     // If verification was successful, refresh the candidate data
//                     await this.fetchCandidateById(candidateId);
                    
//                     // Also update the candidate in the candidates array
//                     update(state => {
//                         const updatedCandidates = state.candidates.map(candidate => {
//                             if (candidate.id === candidateId) {
//                                 return {
//                                     ...candidate,
//                                     adminVerification: verificationStatus
//                                 };
//                             }
//                             return candidate;
//                         });
                        
//                         return {
//                             ...state,
//                             candidates: updatedCandidates,
//                             loading: false,
//                             error: null
//                         };
//                     });
                    
//                     return { success: true, message: result.message };
//                 } else {
//                     update(state => ({
//                         ...state,
//                         loading: false,
//                         error: result.message
//                     }));
                    
//                     return { success: false, message: result.message };
//                 }
//             } catch (error) {
//                 const errorMessage = error instanceof Error ? error.message : 'Failed to verify candidate';
                
//                 update(state => ({
//                     ...state,
//                     loading: false,
//                     error: errorMessage
//                 }));
                
//                 return { success: false, message: errorMessage };
//             }
//         },
//         // Reset store
//         reset() {
//             set({
//                 candidates: [],
//                 selectedCandidate: {
//                     details: null,
//                     qualifications: [],
//                     references: [],
//                     other_documents: [],
//                     applied_jobs: [],
//                     availability_schedule: {
//                         Monday: [],
//                         Tuesday: [],
//                         Wednesday: [],
//                         Thursday: [],
//                         Friday: [],
//                         Saturday: [],
//                         Sunday: []
//                     },
//                     bookings: []
//                 },
//                 loading: false,
//                 error: null
//             });
//         }
//     };
// }

// export const candidateStore = createCandidateStore();


import { writable } from 'svelte/store';
import { CandidateService } from './candidate.services';
import type { Candidate, CandidateQueryParams, DetailedCandidate } from './candidate.types';

interface CandidateState {
    candidates: Candidate[];
    loading: boolean;
    error: string | null;
    pagination: {
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    filters: CandidateQueryParams;
}

const initialState: CandidateState = {
    candidates: [],
    loading: false,
    error: null,
    pagination: {
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    },
    filters: {
        userType: 'candidate',
        page: 1,
        pageSize: 10
    }
};

function createCandidateStore() {
    const { subscribe, update, set } = writable<CandidateState>(initialState);
    let currentState = initialState;

    // Keep track of current state
    subscribe(state => {
        currentState = state;
    });

    return {
        subscribe,
        async fetchCandidates(params?: CandidateQueryParams) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const queryParams = { ...currentState.filters, ...params };
                const response = await CandidateService.getCandidatesOnly(queryParams);
                
                update(state => ({
                    ...state,
                    candidates: response.data.items,
                    pagination: {
                        totalCount: response.data.totalCount,
                        page: response.data.page,
                        pageSize: response.data.pageSize,
                        totalPages: response.data.totalPages,
                        hasNextPage: response.data.hasNextPage,
                        hasPreviousPage: response.data.hasPreviousPage
                    },
                    filters: queryParams,
                    loading: false,
                    error: null
                }));
                // console.log(response.data.items);
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch candidates'
                }));
            }
        },
        
        async searchCandidates(search: string) {
            this.fetchCandidates({ search, page: 1 });
        },
        
        async filterByStatus(isActive: boolean) {
            this.fetchCandidates({ isActive, page: 1 });
        },
        
        async filterByAdminVerification(isAdminVerified: boolean | null) {
            update(state => ({
                ...state,
                filters: {
                    ...state.filters,
                    isAdminVerified: isAdminVerified ?? undefined
                }
            }));
            this.fetchCandidates({ page: 1 });
        },
        
        async filterByEmailVerification(isEmailVerified: boolean | null) {
            update(state => ({
                ...state,
                filters: {
                    ...state.filters,
                    isEmailVerified: isEmailVerified ?? undefined
                }
            }));
            this.fetchCandidates({ page: 1 });
        },
        
        async goToPage(page: number) {
            this.fetchCandidates({ page });
        },
        
        async changePageSize(pageSize: number) {
            this.fetchCandidates({ pageSize, page: 1 });
        },
        
        // Get single candidate
        async getSingleCandidate(userId: string): Promise<{ success: boolean; data?: DetailedCandidate; message?: string }> {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const result = await CandidateService.getSingleCandidate(userId);
                
                if (result.success && result.data) {
                    return { success: true, data: result.data };
                } else {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: result.message || 'Failed to fetch candidate'
                    }));
                    return { success: false, message: result.message || 'Failed to fetch candidate' };
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch candidate';
                update(state => ({
                    ...state,
                    loading: false,
                    error: errorMessage
                }));
                return { success: false, message: errorMessage };
            } finally {
                update(state => ({ ...state, loading: false }));
            }
        },
        
        async verifyCandidate(candidateId: string, verificationStatus: boolean) {
            try {
                const isAdminVerified = verificationStatus === true;
                const result = await CandidateService.verifyCandidate(candidateId, isAdminVerified);
                
                if (result.success) {
                    // Reload all candidates after successful verification
                    await this.fetchCandidates();
                    return { success: true, message: result.message };
                } else {
                    return { success: false, message: result.message };
                }
            } catch (error) {
                return { 
                    success: false, 
                    message: error instanceof Error ? error.message : 'Failed to verify candidate' 
                };
            }
        },

        // singleCandidate 
        
        reset() {
            update(() => initialState);
        }
    };
}

export const candidateStore = createCandidateStore();
