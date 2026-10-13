export interface User {
  id: number;
  email: string;
  username: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  department: string;
  job_title: string;
  employment_status: 'Active' | 'Inactive';
  date_of_joining: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  full_name: string;
  email: string;
  phone_number: string;
  department: string;
  job_title: string;
  employment_status: 'Active' | 'Inactive';
  date_of_joining: string;
  notes: string;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  departments_count: number;
  department_distribution: Record<string, number>;
}
