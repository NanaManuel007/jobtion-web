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

export type { ReportRequestBody, ReportResponse, PayrollRecord, ReportSummary };