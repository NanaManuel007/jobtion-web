export interface ApplicationClient {
  id: string;
  title: string | null;
  ceoFirstName: string;
  ceoLastName: string;
  otherName: string | null;
  companyJobTitle: string;
  email: string;
  phoneNumber: string;
  address: string;
  aboutCompany: string | null;
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

export interface ApplicationCandidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobType: string;
  employmentType: string;
  paymentType: string;
  amount: number;
  status: string;
  interviewDate: string | null;
  interviewTime: string | null;
  interviewLocation: string | null;
  interviewInviteLink: string | null;
  interviewBy: string | null;
  interviewNotes: string | null;
  assignmentStartDate: string | null;
  assignmentEndDate: string | null;
  appliedAt: string;
  updatedAt: string | null;
  client: ApplicationClient;
  candidate: ApplicationCandidate;
}

export interface ApplicationListResponse {
  data: {
    applications: Application[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  success: boolean;
  statusCode: number;
  responseBody: string;
  errors: any;
  timestamp: string;
}

export interface ApplicationQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}