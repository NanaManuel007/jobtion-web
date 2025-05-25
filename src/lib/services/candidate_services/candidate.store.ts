
import { writable } from 'svelte/store';
import type { Candidate, Verification, CandidateQualification, CandidateReference, CandidateOtherDocument, AppliedJob, AvailabilitySchedule, Booking } from './candidate.type';
import { CandidateService } from './candidate.services';

function createCandidateStore() {
    const { subscribe, set, update } = writable<{
        candidates: Candidate[];
        selectedCandidate: {
            details: Candidate | null;
            qualifications: CandidateQualification[];
            references: CandidateReference[];
            other_documents: CandidateOtherDocument[];
            applied_jobs: AppliedJob[];
            availability_schedule: AvailabilitySchedule;
            bookings: Booking[];
        };
        loading: boolean;
        error: string | null;
    }>({
        candidates: [],
        selectedCandidate: {
            details: null,
            qualifications: [],
            references: [],
            other_documents: [],
            applied_jobs: [],
            availability_schedule: {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: []
            },
            bookings: []
        },
        loading: false,
        error: null
    });

    return {
        subscribe,
        
        // Fetch all candidates
        async fetchCandidates() {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const candidates = await CandidateService.getAllCandidates();
                update(state => ({
                    ...state,
                    candidates,
                    loading: false,
                    error: null
                }));
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch candidates'
                }));
            }
        },       
         async refreshCandidateData(id: number) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const candidateDetails = await CandidateService.getCandidateById(id);
                if (candidateDetails) {
                    update(state => ({
                        ...state,
                        selectedCandidate: {
                            details: candidateDetails.details,
                            qualifications: candidateDetails.qualifications,
                            references: candidateDetails.references,
                            other_documents: candidateDetails.other_documents,
                            applied_jobs: candidateDetails.applied_jobs,
                            availability_schedule: candidateDetails.availability_schedule,
                            bookings: candidateDetails.bookings
                        },
                        loading: false,
                        error: null
                    }));
                    return true;
                }
                return false;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to refresh candidate data'
                }));
                return false;
            }
        },

        // Fetch single candidate
        // async fetchCandidateById(id: number) {
        //     update(state => ({ ...state, loading: true, error: null }));
        //     try {
        //         const candidateDetails = await CandidateService.getCandidateById(id);
        //         if (candidateDetails) {
        //             update(state => ({
        //                 ...state,
        //                 selectedCandidate: {
        //                     details: candidateDetails.details,
        //                     qualifications: candidateDetails.qualifications,
        //                     references: candidateDetails.references,
        //                     other_documents: candidateDetails.other_documents
        //                 },
        //                 loading: false,
        //                 error: null
        //             }));
        //         }
        //     } catch (error) {
        //         update(state => ({
        //             ...state,
        //             loading: false,
        //             error: error instanceof Error ? error.message : 'Failed to fetch candidate'
        //         }));
        //     }
        // },

        async fetchCandidateById(id: number) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const candidateDetails = await CandidateService.getCandidateById(id);
                if (candidateDetails) {
                    update(state => ({
                        ...state,
                        selectedCandidate: {
                            details: candidateDetails.details,
                            qualifications: candidateDetails.qualifications,
                            references: candidateDetails.references,
                            other_documents: candidateDetails.other_documents,
                            applied_jobs: candidateDetails.applied_jobs,
                            availability_schedule: candidateDetails.availability_schedule,
                            bookings: candidateDetails.bookings
                        },
                        loading: false,
                        error: null
                    }));
                }
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch candidate'
                }));
            }
        },
        async fetchCandidateByIdUpdateDate(id: number) {
            update(state => ({ ...state, loading: false, error: null }));
            try {
                const candidateDetails = await CandidateService.getCandidateById(id);
                if (candidateDetails) {
                    update(state => ({
                        ...state,
                        selectedCandidate: {
                            details: candidateDetails.details,
                            qualifications: candidateDetails.qualifications,
                            references: candidateDetails.references,
                            other_documents: candidateDetails.other_documents,
                            applied_jobs: candidateDetails.applied_jobs,
                            availability_schedule: candidateDetails.availability_schedule,
                            bookings: candidateDetails.bookings
                        },
                        loading: false,
                        error: null
                    }));
                }
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch candidate'
                }));
            }
        },
        //user verification
        async verifyCandidate(candidateId: number, verificationStatus: number) {
            update(state => ({ ...state, loading: true, error: null }));
            
            try {
                const verification: Verification = {
                    id: candidateId,
                    verification_status: verificationStatus
                };
                
                const result = await CandidateService.verifyCandidate(verification);
                
                if (result.success) {
                    // If verification was successful, refresh the candidate data
                    await this.fetchCandidateById(candidateId);
                    
                    // Also update the candidate in the candidates array
                    update(state => {
                        const updatedCandidates = state.candidates.map(candidate => {
                            if (candidate.id === candidateId) {
                                return {
                                    ...candidate,
                                    adminVerification: verificationStatus
                                };
                            }
                            return candidate;
                        });
                        
                        return {
                            ...state,
                            candidates: updatedCandidates,
                            loading: false,
                            error: null
                        };
                    });
                    
                    return { success: true, message: result.message };
                } else {
                    update(state => ({
                        ...state,
                        loading: false,
                        error: result.message
                    }));
                    
                    return { success: false, message: result.message };
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to verify candidate';
                
                update(state => ({
                    ...state,
                    loading: false,
                    error: errorMessage
                }));
                
                return { success: false, message: errorMessage };
            }
        },
        // Reset store
        reset() {
            set({
                candidates: [],
                selectedCandidate: {
                    details: null,
                    qualifications: [],
                    references: [],
                    other_documents: [],
                    applied_jobs: [],
                    availability_schedule: {
                        Monday: [],
                        Tuesday: [],
                        Wednesday: [],
                        Thursday: [],
                        Friday: [],
                        Saturday: [],
                        Sunday: []
                    },
                    bookings: []
                },
                loading: false,
                error: null
            });
        }
    };
}

export const candidateStore = createCandidateStore();