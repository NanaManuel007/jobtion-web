

export type DayId = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type DaySession = {
    day: string;
    start_at: string;
    start_end: string;
    // enabled:boolean;
    
};


export interface WorkingHours {
    sunday: DaySession;
    monday: DaySession;
    tuesday: DaySession;
    wednesday: DaySession;
    thursday: DaySession;
    friday: DaySession;
    saturday: DaySession;
}

export type JobType = 'Permanent' | 'Temporary';

export type JobBase = {
    job_title: string;
    payment_type: string;
    location: string;
    amount: number;
    // from_amount: number;
    // to_amount: number;
    employment_type: string;
    job_location: string;
    hours: number;
    duty_1: string;
    duty_2?: string;
    duty_3?: string;
    duty_4?: string;
    requirment_1: string;
    requirment_2?: string;
    requirment_3?: string;
    requirment_4?: string;
    company_id: number;
    posted_start_date: string;
    posted_roles: number;
    roles: number;
    publish: number;
};

export type JobPermanent = JobBase & {
    job_type: 'Permanent';
};

export type JobTemporary = JobBase & {
    job_type: 'Temporary';
    days_sessions: DaySession[];
};

// export type JobData = JobPermanent | JobTemporary;

export type TemporaryType = 'Per Hour' | 'Per Day' | 'Per Week';
export type PermanentType = 'Per Month' | 'Per Annum' | 'Per Term';
export type PermanentEmploymentType = 'Term Time' | 'Part Time' | 'Full Time';

export const temporaryTypes: TemporaryType[] = ['Per Hour', 'Per Day', 'Per Week'];
export const permanentTypes: PermanentType[] = ['Per Month', 'Per Annum', 'Per Term'];
export const paymentTypes: PermanentEmploymentType[] = ['Term Time', 'Part Time', 'Full Time',];
export const jobTypes: JobType[] = ['Permanent', 'Temporary'];
export interface JobApplication {
    app_id: number;
    interview_date: string | null;
    interview_time: string | null;
    interview_invite_link: string | null;
    interview_by: string | null;
    pronouns: string | null;
    title: string | null;
    first_name: string;
    last_name: string;
    email: string;
    candidate_photo: string | null;
    candidate_number: string;
    gender: string | null;
    status: string;
}
//constants
export const weekDays: Array<{ id: DayId; label: string }> = [
    { id: 'sunday', label: 'Sunday' },
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' }
];

// all jobs 
// export type JobResponse = {
//     id: number;
//     job_title: string;
//     payment_type: string;
//     amount: number;
//     // from_amount: number;
//     // to_amount: number;
//     job_type: JobType;
//     employment_type: PermanentEmploymentType;
//     job_location: string;
//     hours: number;
//     duty_1: string;
//     duty_2: string | null;
//     duty_3: string | null;
//     duty_4: string | null;
//     requirment_1: string;
//     requirment_2: string | null;
//     requirment_3: string | null;
//     requirment_4: string | null;
//     company_id: number;
//     posted_start_date: string;
//     posted_roles: number;
//     publish: number;
//     position: string | null;
//     job_desc: string | null;
//     job_requirement: string | null;
//     time_of_posting_job: string;
//     day_session?: Record<string, {
//         day: string;
//         break_time: string;
//         start_at: string;
//         start_end: string;
//     }> | null;
//     applications: JobApplication[];
//     created_at: string;
//     updated_at: string;
// };

export type BookJob = {
    jobId:number,
    candidateId:number
}

// New API Response Types for Permanent Jobs
export type PermanentJobAPI = {
    id: string;
    jobTitle: string;
    paymentType: string;
    amount: number;
    jobType: string;
    employmentType: string;
    jobLocation: string;
    hours: number;
    duty1: string;
    duty2: string;
    duty3: string;
    duty4: string;
    requirement1: string;
    requirement2: string;
    requirement3: string;
    requirement4: string;
    position: string;
    jobDescription: string;
    jobRequirement: string;
    clientId: string;
    companyName: string;
    postedStartDate: string;
    postedRoles: number;
    isPublished: boolean;
    timeOfPostingJob: string;
    applicationCount: number;
    createdAt: string;
    updatedAt: string;
};

export type PermanentJobsResponse = {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        jobs: PermanentJobAPI[];
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
};

// Create Job Request for new API
export type PermanentJobCreateRequest = {
    jobTitle: string;
    paymentType: string;
    amount: number;
    jobType: 'Permanent';
    employmentType: string;
    jobLocation: string;
    hours: number;
    duty1: string;
    duty2?: string;
    duty3?: string;
    duty4?: string;
    requirement1: string;
    requirement2?: string;
    requirement3?: string;
    requirement4?: string;
    position?: string;
    jobDescription?: string;
    jobRequirement?: string;
    clientId: string;
    postedStartDate: string;
    postedRoles: number;
    isPublished: boolean;
};

export type JobData = {
    jobTitle: string;
    clientId: string;
    paymentType: string;
    amount: number;
    jobType: string;
    employmentType: string;
    jobLocation: string;
    hours: number;
    duty1: string;
    duty2: string;
    duty3: string;
    duty4: string;
    requirement1: string;
    requirement2: string;
    requirement3: string;
    requirement4: string;
    position: string;
    jobDescription: string;
    jobRequirement: string;
    postedStartDate: string;
    postedRoles: number;
    isPublished: boolean;
};

export type JobResponse = {
    id: number;
    jobTitle: string;
    clientId: string;
    paymentType: string;
    amount: number;
    jobType: string;
    employmentType: string;
    jobLocation: string;
    hours: number;
    duty1: string;
    duty2: string | null;
    duty3: string | null;
    duty4: string | null;
    requirement1: string;
    requirement2: string | null;
    requirement3: string | null;
    requirement4: string | null;
    position: string | null;
    jobDescription: string | null;
    jobRequirement: string | null;
    postedStartDate: string;
    postedRoles: number;
    isPublished: boolean;
    timeOfPostingJob: string;
    applications: JobApplication[];
    createdAt: string;
    updatedAt: string;
};


// Updated Internal Job Types
export type InternalJobCreateRequest = {
    jobTitle: string;
    paymentType: string;
    jobType: string;
    employmentType: string;
    jobLocation: string;
    longitude: number;
    latitude: number;
    hours: number;
    duty1: string;
    duty2?: string;
    duty3?: string;
    duty4?: string;
    requirement1: string;
    requirement2?: string;
    requirement3?: string;
    requirement4?: string;
    position?: string;
    jobDescription?: string;
    jobRequirement?: string;
    companyName: string;
    postedStartDate: string;
    jobStartDate: string;
    jobCloseDate: string;
    requiredLevel: string;
};

export type InternalJobUpdateRequest = InternalJobCreateRequest;

export type InternalJobAPI = {
    id: string;
    jobTitle: string;
    paymentType: string;
    jobType: string;
    employmentType: string;
    jobLocation: string;
    longitude: number;
    latitude: number;
    hours: number;
    duty1: string;
    duty2: string;
    duty3: string;
    duty4: string;
    requirement1: string;
    requirement2: string;
    requirement3: string;
    requirement4: string;
    position: string;
    jobDescription: string;
    jobRequirement: string;
    clientId: string;
    companyName: string;
    postedStartDate: string;
    jobStartDate: string;
    jobCloseDate: string;
    createdByAdminId: string;
    isCreatedByAdmin: boolean;
    currentClientCharges: number;
    currentClientTemporaryCharge: number;
    temporaryChargesIsActive: boolean;
    numberOfRolesAvailable: number;
    isPublished: boolean;
    requiredLevel: string;
    createdAt: string;
    updatedAt: string;
};

export type InternalJobsResponse = {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        jobs: InternalJobAPI[];
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
};

// Weekly Timesheet Types
export type DayTimesheet = {
    workDate: string;
    start: string;
    finish: string;
    break: string;
    expense: number;
    miles: number;
    rating: number;
    notes: string;
    longitude: number;
    latitude: number;
};

export type WeeklyTimesheetCreateRequest = {
    weekStartDate: string;
    monday: DayTimesheet;
    tuesday: DayTimesheet;
    wednesday: DayTimesheet;
    thursday: DayTimesheet;
    friday: DayTimesheet;
    saturday: DayTimesheet;
    sunday: DayTimesheet;
};

export type WeeklyTimesheetAPI = {
    id: string;
    jobId: string;
    clientId: string;
    companyName:string;
    internalJobId:string;
    candidateId: string;
    weekStartDate: string;
    candidateFirstName:string;
    jobTitle:string;
    candidateLastName:string;
    candidateEmail:string;
    weeklyStatus: 'pending' | 'completed';
    monday: DayTimesheet;
    tuesday: DayTimesheet;
    wednesday: DayTimesheet;
    thursday: DayTimesheet;
    friday: DayTimesheet;
    saturday: DayTimesheet;
    sunday: DayTimesheet;
    createdAt: string;
    updatedAt: string;
};

export type WeeklyTimesheetsResponse = {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        weeklyTimesheets: WeeklyTimesheetAPI[];
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
};

export type CandidateAPI = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // Add other candidate fields as needed
};

export type CandidatesResponse = {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        items: CandidateAPI[];
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
};