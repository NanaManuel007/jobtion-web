export interface TSM {
    id: number;
    user_id: number;
    job_id: number;
    title: string;
    first_name: string;
    last_name: string;
    email: string;
    job_title: string;
    location:string;
    client_id: number;
    day: string;
    start: string;
    end: string;
    break_time: string;
    break_time_updated: number;
    payment_type: string;
    amount: number;
}   

export interface Approval {
    id: number;
    candidateName: string;
    candidateEmail: string;
    location:string;
    amount:number;
    jobRole: string;
    jobType: string;
    approvalType: string;
    status: string;
    totalAmount: number;
    date: string;
    submittedStartTime?: string;
    submittedEndTime?: string;
    submittedBreakTime?: string;
    startTime?: string;
    endTime?: string;
    breakTime?: string;
    tsmData?: TSM;
}

export interface TSMUpdatePayload {
    tsm_id: number;
    start: string;
    end: string;
    break_time: string;
    amount:number;
    location:string;
}

// Updated interface to match the new API response
export interface InvoiceEntry {
    id: string;
    weeklyTimesheetId: string;
    byOurRef: string;
    companyName: string;
    fullAddress: string;
    slotStart: string;
    sageName: string;
    candidateID: string;
    tempName: string;
    jobTitle: string;
    payeeSelfEmp: string;
    rate: number;
    charge: number;
    tsPay: number;
    candidateGrossPay: number;
    margin: number;
    totalInvoice: number;
    payRollProvider: string;
    poNumber: string | null;
    owner: string | null;
    notes: string | null;
    totalHours: number;
    taxAmount: number;
    vatAmount: number;
    clientTotalBeforeVAT: number;
    createdAt: string;
    updatedAt: string | null;
    isInvoiceGeneratedToClient: boolean;
    isClientPaid: boolean;
    isCandidatePaid: boolean;
    isTotalInvoiceGenerated: boolean;
}

// Updated response interface for the new API structure
// Add pagination parameters interface
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    fromDate?: string; // Date in ISO format like "2025-07-24T18:58:44.182Z"
    toDate?: string;   // Date in ISO format like "2025-07-24T18:58:44.182Z"
    isInvoiceGeneratedToClient?: boolean; // Filter by invoice generation status, defaults to false
}

// Add pagination metadata interface
export interface PaginationMeta {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Update InvoiceResponse to include pagination metadata
export interface InvoiceResponse {
    data: {
        invoices: InvoiceEntry[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: any;
    timestamp: string;
}

// Add response wrapper for paginated invoice data
export interface PaginatedInvoiceResponse {
    invoices: InvoiceEntry[];
    pagination: PaginationMeta;
}

// Keep the old TimesheetEntry for backward compatibility if needed
export interface TimesheetEntry {
    byOurRef?: string;
    CompanyName?: string;
    FullAddress?: string;
    SlotStart?: string;
    SageName?: string | null;
    CandidateID?: number;
    TempName?: string;
    'Job title'?: string;
    'PAYE/Self Emp'?: string | null;
    Rate?: string;
    Charge?: string;
    TSPay?: string;
    Margin?: string;
    DecimalHours?: number;
    TotalInvoice?: string;
    PlusVat?: string;
    payroll_provider?: string;
    PONumber?: string | null;
    Owner?: string;
    Notes?: string;
}

interface ReportRequestBody {
    start_date: string;
    end_date: string;
}

interface ReportCalculationDetails {
    base_amount: number;
    payment_type: string;
    gross_hours: string;
    break_hours: string;
    decimal_hours: number;
}

interface PayrollRecord {
    OurRef: string;
    CompanyName: string;
    FullAddress: string;
    SlotStart: string;
    'Sage Name': string;
    CandidateID: number;
    'Temp Name': string;
    'Job title': string;
    'PAYE/Self Emp': string;
    ' Rate ': string;
    ' Charge ': string;
    ' TSPay ': string;
    ' Margin ': string;
    DecimalHours: number;
    ' TotalInvoice ': string;
    ' PlusVat ': string;
    payroll_provider: string;
    PONumber: string;
    Owner: string;
    Notes: string;
    _calculation_details: ReportCalculationDetails;
}

interface ReportSummary {
    total_records: number;
    total_hours: number;
    total_tspay: number;
    total_invoice: number;
    total_vat: number;
    unique_companies: number;
    unique_candidates: number;
}

interface ReportResponse {
    success: boolean;
    message: string;
    data: {
        summary: ReportSummary;
        payroll_records: PayrollRecord[];
    };
}

// Add new interfaces for candidate payslips
// Updated interfaces for candidate payslips to match new API structure
export interface PayslipEntry {
    id: string;
    candidateId: string;
    weeklyTimesheetIds: string;
    payslipReference: string;
    companyNames: string;
    jobTitles: string;
    weekEnding: string;
    totalHours: number;
    rate: number;
    grossPay: number;
    taxAmount: number;
    netPay: number;
    cumulativeGrossPay: number;
    cumulativeTaxPaid: number;
    cumulativeNetPay: number;
    createdAt: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
}

export interface GroupedPayslip {
    completedDate: string;
    candidateId: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
    payslips: PayslipEntry[];
    totalGrossPay: number;
    totalTaxAmount: number;
    totalNetPay: number;
    totalHours: number;
    payslipCount: number;
}

export interface PayslipResponse {
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: string;
    timestamp: string;
    data: {
        candidatePayslips: GroupedPayslip[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
    };
}

export interface PayslipPaginationParams {
    pageNumber?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
}

export type { ReportRequestBody, ReportResponse, PayrollRecord, ReportSummary };


// Client Invoice Types
export interface ClientInvoiceEntry {
    id: string;
    weeklyTimesheetId: string;
    byOurRef: string;
    companyName: string;
    fullAddress: string;
    slotStart: string;
    sageName: string;
    candidateID: string;
    tempName: string;
    jobTitle: string;
    payeeSelfEmp: string;
    rate: number;
    charge: number;
    tsPay: number;
    candidateGrossPay: number;
    margin: number;
    totalInvoice: number;
    payRollProvider: string;
    poNumber: string;
    owner: string;
    notes: string;
    totalHours: number;
    taxAmount: number;
    vatAmount: number;
    clientTotalBeforeVAT: number;
    isClientPaid: boolean;
    isAdminReceivedPayment: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ClientInvoiceGroup {
    companyName: string;
    createdAtSameDateOrganization: string;
    invoices: ClientInvoiceEntry[];
    totalAmount: number;
    totalVAT: number;
    grandTotal: number;
    totalJobs: number;
}

export interface ClientInvoiceResponse {
    data: {
        clientInvoices: ClientInvoiceGroup[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
    };
    success: boolean;
    statusCode: number;
    responseBody: string;
    errors: any;
    timestamp: string;
}

export interface ClientInvoicePaginationParams {
    pageNumber?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
}

export interface PaginatedClientInvoiceResponse {
    clientInvoices: ClientInvoiceGroup[];
    pagination: {
        totalCount: number;
        pageNumber: number;
        pageSize: number;
    };
}