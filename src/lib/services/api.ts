

export const API_CONFIG = {
    BASE_URL: 'https://node.jobtiondevs.com/api/jobtion/', 
    ENDPOINTS: {
        AUTH: {
            LOGIN: 'authenticate',
            CREATEADMIN: 'create-admin',
            EDITADMIN: 'update-admin',
            ALLADMINS: 'get-all-admins',
        },
        USERS: {
            PROFILE: 'get-user-details',
            UPDATE: '/users/update',
        },
        ROLES: {
            ADDROLE: 'add-role',
            UPDATEROLE: 'update-role',
            DELETEROLE: 'delete-role',
            GETROLES: 'fetch-roles',
        },
        COMPANIES: {
            LIST: 'get-all-client',
            CREATE: 'add-new-client',
            UPDATE: 'update-new-client',
            DELETE: 'delete-job',
            UNARCHIVE: 'fetch',
            DETAILS: 'fetch-single-client',
        },
        JOBS: {
            CREATE: 'post-job',
            UPDATE: 'update-job',
            ALLPERMANENTJOBS: 'get-all-permanent-jobs',
            ALLTEMPORARYJOBS: 'get-all-temporary-jobs',
            DELETE: 'delete-job',
            ALLPOSTEDJOBS: 'get-all-posted_jobs',
            UNARCHIVE: 'un-achieve-client',
            CREATEBOOKING: 'create-booking',
            DELETEBOOKING: 'delete-booking',
            GETBOOKING: 'get-all-bookings',
            PUBLISHJOB: 'update-job-status',
            GETAPPLICATIONS: 'get-all',
            APPROVEAPPLICATION: 'accept',
            DECLINEAPPLICATION: 'decline',
            SETINTVERVIEW: 'set-interview',

        },
        
        CANDIDATES: {
            LIST: 'get-all-candidate',
            DETAILS: 'fetch-single-candidate',
            VERIFYCANDIDATE: 'verify-candidate',
            ANALYTICS: '/companies/:id/analytics',
        },
        REPORTS: {
            GENERAL: 'get-report',
            GENERATEREPORT: 'fetch-report',
            GENERATEPAYSLIP: 'store-payslip',
            USER: '/reports/users',
            CLIENT: '/reports/clients',
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
