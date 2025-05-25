export interface ClientsType {
    id: number;
    pronouns: string | null;
    title: string | null;
    company_name: string;
    first_name: string;
    last_name: string;
    other_name: string | null;
    company_job_title: string;
    email: string;
    user_type: string;
    email_verified_at: string | null;
    phone_number: string;
    address: string;
    crn: string | null;
    urn: string | null;
    dob: string | null;
    gender: string | null;
    about_me: string | null;
    profile_picture: string | null;
    identification: string | null;
    proof_of_address: string | null;
    national_identity: string | null;
    company_house_number: string | null;
    website: string | null;
    lat: number | null;
    postcode: string | null;
    lng: number | null;
    verified: number;
    email_verified: number;
    admin_verification: number;
    password: string;
    remember_token: string | null;
    fcm_token: string | null;
    total_jobs_posted: number;
    achieved: number;
    created_at: string;
    updated_at: string;
    linkedin: string | null;
}
export interface ClientBooking {
    id: number;
    company_name: string;
    job_title: string;
    candidate_status: string;
    booking_status: string;
}
export interface AppliedCandidate {
    job_title: string;
    title: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    job_id: number;
    candidate_id: number;
    company_name: string;
    job_type: string;
    employment_type: string;
    status: string;
    interview_invite_link: string | null;
    interview_date: string | null;
    interview_time: string | null;
    interview_by: string | null;
    created_at: string;
    location: string;
    hours: number;
    days_sessions: DaySession[];
    tsm: TSM[];
}

export interface DaySession {
    day: string;
    start_at: string;
    start_end: string;
}
export type TSM = {
    tsm_id: number;
    day: string;
    start: string;
    end: string;
    break_time: string;
    job_title: string;
    break_time_updated: number;
};
export type CustomerStatus = 'verified' | 'unverified' ;
export interface ClientListResponse {
    success: boolean;
    message: string;
    data: {
        clients: ClientsType[];
        total: number;
        page: number;
        limit: number;
    };
}
export interface SelectedClientType {
    success: boolean;
    message: string;
    data: {
        success: boolean;
        client: ClientsType;
        applied_candidates: AppliedCandidate[]; 
        bookings: ClientBooking[];
        
    };
}

