export interface Application {
  id: number;
  profile_picture: string | null;
  title: string;
  first_name: string;
  last_name: string;
  company_id: number;
  company_name: string;
  job_id: number;
  job_title: string;
  job_type: string;
  posted_roles: number;
  interview_invite_link: string | null;
  interview_date: string;
  interview_time: string;
  interview_by: string;
  status: 'accepted' | 'rejected' | 'pending' | string; // Using union type for possible status values
  created_at: string;
}