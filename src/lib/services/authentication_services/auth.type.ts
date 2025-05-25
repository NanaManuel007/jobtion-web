
export interface AdminDetails {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role_id: number;
}

export interface AccessRole {
    id: number;
    role_name: string;
    role_description: string;
    access: string[];
}

export interface AdminLoginResponse {
    success: boolean;
    message: string;
    data: {
        admin_details: AdminDetails;
        access: AccessRole;
        access_token: string;
    }
}