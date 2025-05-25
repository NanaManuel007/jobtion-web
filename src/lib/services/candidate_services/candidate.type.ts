export type Candidate = {
    id: number;
    pronouns: string | null;
    title: string | null;
    companyName: string | null;
    firstName: string;
    lastName: string | null;
    otherName: string | null;
    companyJobTitle: string | null;
    email: string;
    userType: string;
    emailVerifiedAt: string | null;
    phoneNumber: string;
    address: string | null;
    crn: string | null;
    urn: string | null;
    dob: string | null;
    gender: string | null;
    aboutMe: string | null;
    profilePicture: string | null;
    identification: string | null;
    proofOfAddress: string | null;
    nationalIdentity: string | null;
    companyHouseNumber: string | null;
    website: string | null;
    lat: number;
    lng: number;
    postcode: string | null;
    verified: number;
    emailVerified: number;
    adminVerification: number;
    password: string;
    rememberToken: string | null;
    fcmToken: string;
    totalJobsPosted: number;
    achieved: number;
    createdAt: string;
    updatedAt: string;
    certificate: string | null;
    dbsCertificate: string | null;
    dbsExpiryDate: string | null;
    dbsSerialNumber: string | null;
    resumeCv: string | null;
    citizen: string | null;
    rightToWorkDoc: string | null;
    rightToWork: string | null;
    editedCv: string | null;
};

//single candidate

// Candidate qualification type
export type CandidateQualification = {
    id: number;
    user_id: number;
    qualification_type: string;
    upload_doc: string;
    created_at: string;
    updated_at: string;
};

// Candidate reference type
export type CandidateReference = {
    id: number;
    type: string;
    doc: string;
    user_id: number;
};

// Candidate other document type
export type CandidateOtherDocument = {
    id?: number;
    type?: string;
    doc?: string;
    user_id?: number;
};

export type AppliedJob = {
    job_title: string;
    job_id: number;
    company_name: string;
    job_type: string;
    employment_type: string;
    status: string;
    interview_invite_link: string | null;
    interview_date: string | null;
    interview_time: string | null;
    interview_by: string | null;
    created_at: string;
    hours: number;
    days_sessions: DaySession[];
    tsm: TSM[];
};

// Day session type
export type DaySession = {
    day: string;
    start_at: string;
    start_end: string;
};

// TSM type
export type TSM = {
    tsm_id: number;
    day: string;
    start: string;
    end: string;
    break_time: string;
    amount: number;
    job_title: string;
    break_time_updated: number;
};

// Availability schedule type
export type AvailabilitySchedule = {
    Monday: any[];
    Tuesday: any[];
    Wednesday: any[];
    Thursday: any[];
    Friday: any[];
    Saturday: any[];
    Sunday: any[];
};

// Booking type
export type Booking = {
    id: number;
    company_name: string;
    job_title: string | null;
    candidate_status: string;
    booking_status: string;
};
// Complete candidate details response type
export type CandidateDetailsResponse = {
    details: Candidate;
    qualifications: CandidateQualification[];
    references: CandidateReference[];
    other_documents: CandidateOtherDocument[];
    applied_jobs: AppliedJob[];
    availability_schedule: AvailabilitySchedule;
    bookings: Booking[];
};


//verification
export type Verification = {
    id: number;
    verification_status: number;
}