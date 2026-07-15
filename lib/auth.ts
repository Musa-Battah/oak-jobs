export interface User {
  id: number;
  email: string;
  username: string;
  display_name?: string;
  password_hash: string;
  is_active: boolean;
  activation_token?: string;
  activation_token_expires?: Date;
  reset_password_token?: string;
  reset_password_token_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: number;
  user_id: number;
  preferred_job_category?: string[];
  preferred_location?: string[];
  bio?: string;
  profile_picture?: string;
}

export interface Job {
  id: number;
  title: string;
  content: string;
  company_name: string;
  company_logo?: string;
  company_tagline?: string;
  job_location: string;
  job_type: string;
  job_salary?: string;
  job_expires?: Date;
  job_category: string[];
  required_qualifications?: string;
  job_experience?: string;
  skills_required?: string;
  application_url?: string;
  application_email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SavedJob {
  id: number;
  user_id: number;
  job_id: number;
  saved_at: Date;
}