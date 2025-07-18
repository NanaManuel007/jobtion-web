export interface ClientsType {
    id: string;
    pronouns: string;
    title: string;
    companyName: string;
    ceoFirstName: string;
    ceoLastName: string;
    otherName: string;
    companyJobTitle: string;
    email: string;
    userType: string;
    phoneNumber: string;
    address: string;
    aboutCompany: string;
    profilePictureUrl: string;
    companyHouseNumber: string;
    website: string;
    postcode: string;
    latitude: number;
    longitude: number;
    isVerified: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt: string;
    adminVerification: boolean;
    totalJobsPosted: number;
    achieved: number;
    currentCharges: number;
    temporaryCharges: number;
    temporaryChargesIsActive: boolean;
    customFields: {
        clientId: string;
        dateTcField: string;
        unqualifiedPartExperienced: number;
        unqualifiedExperience: number;
        childrenLevelTwo: number;
        childrenLevelThree: number;
        childrenLevelFourAndUp: number;
        nurseryChef: number;
        findersFeeStandard: number;
        findersFeePermOneToFourWeeks: number;
        findersFeePermFiveToEightWeeks: number;
        findersFeePermEightToTwelveWeeks: number;
        teachingAssistant: number;
        senTeachingAssistant: number;
        supplyTeacher: number;
        qualifiedNurseryStaff: number;
        longTermTeacher: number;
        longTermStaff: number;
        longTermTA: number;
        longTermSenTA: number;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ClientsResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        clients: ClientsType[];
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
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
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: ClientsType;
}

export interface ClientStatisticsData {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    acceptedApplications: number;
    totalJobsPosted: number;
    achieved: number;
    totalInternalApplications: number;
    totalJobCompleted: number;
}

export interface ClientStatisticsResponse {
    data: ClientStatisticsData;
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string | null;
    timestamp: string;
}


// Client Charges Types
export interface ClientChargesData {
    clientId: string;
    currentCharges: number;
    temporaryCharges: number;
    temporaryChargesIsActive: boolean;
    lastUpdated: string;
}

export interface ClientChargesResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string | null;
    timestamp: string;
    data: ClientChargesData;
}

export interface ClientChargesUpdateRequest {
    currentCharges: number;
    temporaryCharges: number;
    temporaryChargesIsActive: boolean;
}

// Custom Fields Types
export interface ClientCustomFieldsData {
    clientId: string;
    dateTcField: string;
    unqualifiedPartExperienced: number;
    unqualifiedExperience: number;
    childrenLevelTwo: number;
    childrenLevelThree: number;
    childrenLevelFourAndUp: number;
    nurseryChef: number;
    findersFeeStandard: number;
    findersFeePermOneToFourWeeks: number;
    findersFeePermFiveToEightWeeks: number;
    findersFeePermEightToTwelveWeeks: number;
    teachingAssistant: number;
    senTeachingAssistant: number;
    supplyTeacher: number;
    qualifiedNurseryStaff: number;
    longTermTeacher: number;
    longTermStaff: number;
    longTermTA: number;
    longTermSenTA: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClientCustomFieldsResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string | null;
    timestamp: string;
    data: ClientCustomFieldsData;
}

export interface ClientCustomFieldsUpdateRequest {
    dateTcField: string;
    unqualifiedPartExperienced: number;
    unqualifiedExperience: number;
    childrenLevelTwo: number;
    childrenLevelThree: number;
    childrenLevelFourAndUp: number;
    nurseryChef: number;
    findersFeeStandard: number;
    findersFeePermOneToFourWeeks: number;
    findersFeePermFiveToEightWeeks: number;
    findersFeePermEightToTwelveWeeks: number;
    teachingAssistant: number;
    senTeachingAssistant: number;
    supplyTeacher: number;
    qualifiedNurseryStaff: number;
    longTermTeacher: number;
    longTermStaff: number;
    longTermTA: number;
    longTermSenTA: number;
}

// Client Contacts Types
export interface ClientContact {
    id: string;
    clientId: string;
    division: string;
    forename: string;
    surname: string;
    jobTitle: string;
    priority: string;
    workTel: string;
    mobileTel: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientContactsData {
    contacts: ClientContact[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface ClientContactsResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string | null;
    timestamp: string;
    data: ClientContactsData;
}

export interface ClientContactCreateRequest {
    division: string;
    forename: string;
    surname: string;
    jobTitle: string;
    priority: string;
    workTel: string;
    mobileTel: string;
    email: string;
}

export interface ClientContactUpdateRequest {
    division: string;
    forename: string;
    surname: string;
    jobTitle: string;
    priority: string;
    workTel: string;
    mobileTel: string;
    email: string;
}

