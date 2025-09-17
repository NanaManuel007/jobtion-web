

export const API_CONFIG = {
    // BASE_URL: 'https://node.jobtiondevs.com/api/jobtion/', 
    IMAGE_URL: 'https://minio-kogckgccwg40sgkksc4k4o4w.46.202.141.196.sslip.io/jobtion/', 
    BASE_URL: 'http://localhost:8080/api/', 
    // BASE_URL: 'https://productionapttmh.quinteduhosting.com/api/',  
    ENDPOINTS: {
        AUTH: {
            LOGIN: 'admin/auth/login',
            CREATEADMIN: 'create-admin',
            EDITADMIN: 'update-admin',
            ALLADMINS: 'admin/auth/all',
        },
        USERS: {
            PROFILE: 'get-user-details',
            UPDATE: '/users/update',
        },
        ROLESANDPERMISSION: {
            ROLE: 'Role',
            ROLEPERMISSION:'permissions',
        },
        COMPANIES: {
            LIST: 'Client',
            CREATE: 'Client/register',
            UPDATE: 'update-new-client',
            DELETE: 'delete-job',
            UNARCHIVE: 'fetch',
            DETAILS: 'Client',
            CONTACTS: 'clients',
        },
        JOBS: {
            CREATE: 'Job',
            PERMANENT: 'Job/my-jobs',
            UPDATE: 'Job',
            ALLPERMANENTJOBS: 'get-all-permanent-jobs',
            ALLTEMPORARYJOBS: 'get-all-temporary-jobs',
            DELETE: 'delete-job',
            ALLPOSTEDJOBS: 'get-all-posted_jobs',
            UNARCHIVE: 'un-achieve-client',
            CREATEBOOKING: 'create-booking',
            DELETEBOOKING: 'delete-booking',
            GETBOOKING: 'get-all-bookings',
            PUBLISHJOB: 'update-job-status',
            GETAPPLICATIONS: 'applications/admin/all',
            APPROVEAPPLICATION: 'accept',
            DECLINEAPPLICATION: 'decline',
            SETINTVERVIEW: 'applications',
        },
        INTERNALJOBS:{
            CREATE:'internal-jobs/Clients',
            LIST: 'internal-jobs/Clients',
            ALLINTERNALJOBS: 'internal-jobs',
            JOBMANIPULATIONS: 'internal-jobs',
        },
        
        CANDIDATES: {
            LIST: 'admin/users',
            DETAILS: 'fetch-single-candidate',
            VERIFYCANDIDATE: 'verify-candidate',
            ANALYTICS: '/companies/:id/analytics',
        },
        REPORTS: {
            GENERAL: 'invoices/weekly-timesheets',
            GENERATEREPORT: 'fetch-report',
            GENERATEPAYSLIP: 'invoices/final-generate',
            CANDIDATE_PAYSLIPS: 'admin/invoices/candidate-payslips',
            USER: '/reports/users',
            CLIENT: '/reports/clients',
            CLIENT_INVOICES: 'admin/invoices/client-summaries'
        },
        TSM: {
            LIST: 'get-all-tms',
            APPROVE: 'approve-tsm',
            UPDATE: 'update-tsm',
            REJECT: 'reject-tsm',
        },
    }
};

export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};
