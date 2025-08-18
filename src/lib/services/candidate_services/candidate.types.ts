export interface Candidate {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    isEmailVerified: boolean;
    isAdminVerified: boolean;
    isSuspended: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    roles: any[];
    permissions: any[];
    title: string | null;
    pronouns: string | null;
    address: string | null;
    phoneNumber: string;
    dateOfBirth: string | null;
    gender: string | null;
    aboutYou: string | null;
    profilePictureUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    isProfileCompleted: boolean;
}

export interface CandidateListResponse {
    data: {
        items: Candidate[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: any;
    timestamp: string;
}

export interface CandidateQueryParams {
    search?: string;
    isActive?: boolean;
    userType?: string;
    page?: number;
    pageSize?: number;
    isAdminVerified?: boolean;
    isEmailVerified?: boolean;
    qualificationReadableName?: string;
}
// full user data

// Detailed candidate interfaces for single user data
export interface ProfileOne {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    pronouns: string;
    address: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    aboutYou: string;
    profilePictureUrl: string;
    identificationDocumentUrl: string;
    proofOfAddressUrl: string;
    longitude: number;
    latitude: number;
    sageName: string;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkSchedule {
    fullTime: boolean;
    termTime: boolean;
    partTime: boolean;
    afterSchool: boolean;
}

export interface JobType {
    permanent: boolean;
    temporary: boolean;
    booking: boolean;
}

export interface ProfileTwo {
    userId: string;
    qualificationLevel: string;
    qualificationDocumentUrl: string;
    cvDocumentUrl: string;
    customizedQualificationUrl: string;
    dbsOnUpdatedServer: boolean;
    dbsCertificateUrl: string;
    dbsSerialNumber: string;
    dbsExpiryDate: string;
    rightToWork: boolean;
    rightToWorkDocumentUrl: string;
    ukCitizen: boolean;
    workSchedule: WorkSchedule;
    jobType: JobType;
    jobRoles: string[];
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BankDetails {
    id: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    sortCode: string;
    accountHolderName: string;
    swiftCode: string;
    iban: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    createdByAdminName: string;
    updatedByAdminName: string;
}

export interface PaymentModel {
    id: string;
    userId: string;
    temporaryCharge: number;
    temporaryChargeActive: boolean;
    qualification: string;
    payment: number;
    createdAt: string;
    updatedAt: string;
    createdByAdminName: string;
    updatedByAdminName: string;
}

export interface JobApplicationClient {
    id: string;
    title: string;
    ceoFirstName: string;
    ceoLastName: string;
    otherName: string;
    companyJobTitle: string;
    email: string;
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
    adminVerification: boolean;
}

export interface JobApplication {
    id: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    jobType: string;
    employmentType: string;
    paymentType: string;
    amount: number;
    status: string;
    interviewDate: string;
    interviewTime: string;
    interviewLocation: string;
    interviewInviteLink: string;
    interviewBy: string;
    interviewNotes: string;
    assignmentStartDate: string;
    assignmentEndDate: string;
    appliedAt: string;
    updatedAt: string;
    client: JobApplicationClient;
}

export interface InternalJobAssignment {
    id: string;
    internalJobId: string;
    jobTitle: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    clientId: string;
    clientName: string;
    imageUrl: string;
    jobLocation: string;
    jobDuties: string;
    jobRequirements: string;
    assignmentStartDate: string;
    assignmentEndDate: string;
    candidatePayment: number;
    candidateTemporaryCharge: number;
    candidateTemporaryChargeActive: boolean;
    candidateQualification: string;
    status: string;
    assignedByAdminId: string;
    assignedByAdminName: string;
    acceptedByAdminId: string;
    acceptedByAdminName: string;
    isApplication: boolean;
    reassignedFromAssignmentId: string;
    reassignmentReason: string;
    totalHoursWorked: number;
    totalHoursRequired: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface CandidateStatistics {
    totalJobApplications: number;
    activeJobApplications: number;
    completedJobApplications: number;
    totalInternalJobAssignments: number;
    activeInternalJobAssignments: number;
    completedInternalJobAssignments: number;
    totalHoursWorked: number;
    totalEarnings: number;
}

export interface DetailedCandidate {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    isEmailVerified: boolean;
    isAdminVerified: boolean;
    isSuspended: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string;
    roles: string[];
    permissions: string[];
    profileOne: ProfileOne;
    profileTwo: ProfileTwo;
    bankDetails: BankDetails;
    paymentModel: PaymentModel;
    jobApplications: JobApplication[];
    internalJobAssignments: InternalJobAssignment[];
    statistics: CandidateStatistics;
}

export interface DetailedCandidateResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: DetailedCandidate;
}
