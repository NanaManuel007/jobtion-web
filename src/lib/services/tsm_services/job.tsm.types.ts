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