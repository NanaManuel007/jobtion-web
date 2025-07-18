

export const API_CONFIG = {
    // BASE_URL: 'https://node.jobtiondevs.com/api/jobtion/', 
    IMAGE_URL: 'https://minio-kogckgccwg40sgkksc4k4o4w.46.202.141.196.sslip.io/jobtion/', 
    BASE_URL: 'http://localhost:8080/api/', 
    // BASE_URL: 'https://5af6-2c0f-2a80-785-3008-a16c-b68e-b1eb-357d.ngrok-free.app/api/jobtion/', 
    ENDPOINTS: {
        AUTH: {
            LOGIN: 'admin/auth/login',
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
            LIST: 'Client',
            CREATE: 'Client/register',
            UPDATE: 'update-new-client',
            DELETE: 'delete-job',
            UNARCHIVE: 'fetch',
            DETAILS: 'Client',
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
        INTERNALJOBS:{
            CREATE:'internal-jobs/Clients',
            LIST: 'internal-jobs/Clients',
            ALLINTERNALJOBS: 'internal-jobs',
            JOBMANIPULATIONS: 'internal-jobs',
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
