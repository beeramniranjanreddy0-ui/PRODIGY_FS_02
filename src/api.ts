import { AuthResponse, Employee, EmployeeFormData, EmployeeListResponse, EmployeeStats, User } from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const DEFAULT_SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1001',
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@prodigyinfotech.com',
    phone_number: '+1-555-0101',
    department: 'Engineering',
    job_title: 'Lead Software Engineer',
    employment_status: 'Active',
    date_of_joining: '2023-02-15',
    notes: 'Core platform maintainer and tech lead for cloud systems.',
    created_at: new Date(2023, 1, 15).toISOString(),
    updated_at: new Date(2023, 1, 15).toISOString(),
  },
  {
    id: 'EMP-1002',
    full_name: 'Michael Chen',
    email: 'michael.chen@prodigyinfotech.com',
    phone_number: '+1-555-0102',
    department: 'Engineering',
    job_title: 'Frontend Developer',
    employment_status: 'Active',
    date_of_joining: '2023-06-01',
    notes: 'React and UI/UX design systems specialist.',
    created_at: new Date(2023, 5, 1).toISOString(),
    updated_at: new Date(2023, 5, 1).toISOString(),
  },
  {
    id: 'EMP-1003',
    full_name: 'Amara Okafor',
    email: 'amara.okafor@prodigyinfotech.com',
    phone_number: '+1-555-0103',
    department: 'Human Resources',
    job_title: 'HR Operations Manager',
    employment_status: 'Active',
    date_of_joining: '2022-11-10',
    notes: 'Talent acquisition, onboarding, and employee relations.',
    created_at: new Date(2022, 10, 10).toISOString(),
    updated_at: new Date(2022, 10, 10).toISOString(),
  },
  {
    id: 'EMP-1004',
    full_name: 'David Rodriguez',
    email: 'david.rodriguez@prodigyinfotech.com',
    phone_number: '+1-555-0104',
    department: 'Finance',
    job_title: 'Senior Financial Analyst',
    employment_status: 'Active',
    date_of_joining: '2023-01-20',
    notes: 'Quarterly audits and financial planning.',
    created_at: new Date(2023, 0, 20).toISOString(),
    updated_at: new Date(2023, 0, 20).toISOString(),
  },
  {
    id: 'EMP-1005',
    full_name: 'Elena Rostova',
    email: 'elena.rostova@prodigyinfotech.com',
    phone_number: '+1-555-0105',
    department: 'Marketing',
    job_title: 'Growth Marketing Specialist',
    employment_status: 'Inactive',
    date_of_joining: '2022-08-15',
    notes: 'Currently on sabbatical leave.',
    created_at: new Date(2022, 7, 15).toISOString(),
    updated_at: new Date(2022, 7, 15).toISOString(),
  },
  {
    id: 'EMP-1006',
    full_name: 'James Wilson',
    email: 'james.wilson@prodigyinfotech.com',
    phone_number: '+1-555-0106',
    department: 'Operations',
    job_title: 'DevOps Engineer',
    employment_status: 'Active',
    date_of_joining: '2023-09-05',
    notes: 'CI/CD pipelines, container orchestration, and monitoring.',
    created_at: new Date(2023, 8, 5).toISOString(),
    updated_at: new Date(2023, 8, 5).toISOString(),
  },
  {
    id: 'EMP-1007',
    full_name: 'Priya Patel',
    email: 'priya.patel@prodigyinfotech.com',
    phone_number: '+1-555-0107',
    department: 'Product',
    job_title: 'Product Manager',
    employment_status: 'Active',
    date_of_joining: '2023-04-18',
    notes: 'Cross-functional product roadmaps and user research.',
    created_at: new Date(2023, 3, 18).toISOString(),
    updated_at: new Date(2023, 3, 18).toISOString(),
  },
];

function getStoredEmployees(): Employee[] {
  const raw = localStorage.getItem('ems_mock_employees');
  if (!raw) {
    localStorage.setItem('ems_mock_employees', JSON.stringify(DEFAULT_SAMPLE_EMPLOYEES));
    return DEFAULT_SAMPLE_EMPLOYEES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAMPLE_EMPLOYEES;
  }
}

function saveStoredEmployees(emps: Employee[]) {
  localStorage.setItem('ems_mock_employees', JSON.stringify(emps));
}

export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem('ems_access_token'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('ems_access_token', accessToken);
    localStorage.setItem('ems_refresh_token', refreshToken);
  },
  getRefreshToken: (): string | null => localStorage.getItem('ems_refresh_token'),
  clearTokens: () => {
    localStorage.removeItem('ems_access_token');
    localStorage.removeItem('ems_refresh_token');
    localStorage.removeItem('ems_user');
  },
  getUser: (): User | null => {
    const raw = localStorage.getItem('ems_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    localStorage.setItem('ems_user', JSON.stringify(user));
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authStorage.getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  // Attempt token refresh on 401 if refresh token is present
  if (response.status === 401 && authStorage.getRefreshToken()) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: authStorage.getRefreshToken() }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.access_token) {
          localStorage.setItem('ems_access_token', refreshData.access_token);
          headers.set('Authorization', `Bearer ${refreshData.access_token}`);
          // Retry original request
          response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers,
          });
        }
      } else {
        authStorage.clearTokens();
      }
    } catch {
      authStorage.clearTokens();
    }
  }

  return response;
}

export const api = {
  // Auth
  async login(email: string, password: string, secretCode?: string): Promise<AuthResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, secret_code: secretCode }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        authStorage.setTokens(data.access_token, data.refresh_token);
        authStorage.setUser(data.user);
        return data;
      }

      // If invalid secret code
      if (res.status === 403) {
        throw new ApiError(403, data.detail || 'Invalid Administrator Secret Code! Verification failed.');
      }

      // If 401 with explicit invalid credentials message
      if (res.status === 401 && data.detail === 'Invalid email or password') {
        throw new ApiError(401, 'Invalid email or password');
      }

      throw new Error(data.detail || 'Server error');
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // If secret code provided and incorrect in offline fallback
      if (secretCode !== undefined && secretCode !== 'PRODIGY@2026') {
        throw new ApiError(403, 'Invalid Administrator Secret Code! Verification failed.');
      }
      // Fallback mode - always Administrator
      const mockUser: User = {
        id: 1,
        email: normalizedEmail || 'admin@prodigy.com',
        username: 'Administrator',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const mockRes: AuthResponse = {
        access_token: `jwt_access_token_admin_${Date.now()}`,
        refresh_token: `jwt_refresh_token_admin_${Date.now()}`,
        token_type: 'bearer',
        user: mockUser,
      };

      authStorage.setTokens(mockRes.access_token, mockRes.refresh_token);
      authStorage.setUser(mockRes.user);
      return mockRes;
    }
  },

  async register(
    email: string,
    username: string,
    password: string,
    role: 'admin' | 'user' = 'admin',
    secretCode?: string
  ): Promise<AuthResponse> {
    try {
      const res = await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password, role, secret_code: secretCode }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data.detail || 'Registration failed', data);
      }

      authStorage.setTokens(data.access_token, data.refresh_token);
      authStorage.setUser(data.user);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (secretCode !== 'PRODIGY@2026') {
        throw new ApiError(403, 'Invalid Administrator Secret Code! Authorization required to create an Admin account.');
      }
      const mockUser: User = {
        id: Math.floor(Math.random() * 9000) + 1000,
        email: email.trim().toLowerCase(),
        username: username.trim(),
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      const mockRes: AuthResponse = {
        access_token: `jwt_token_admin_${Date.now()}`,
        refresh_token: `refresh_token_admin_${Date.now()}`,
        token_type: 'bearer',
        user: mockUser,
      };
      authStorage.setTokens(mockRes.access_token, mockRes.refresh_token);
      authStorage.setUser(mockRes.user);
      return mockRes;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const res = await fetchWithAuth('/auth/me');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data.detail || 'Failed to fetch user profile', data);
      }
      authStorage.setUser(data);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      const user = authStorage.getUser();
      if (!user) {
        throw new ApiError(401, 'Unauthenticated');
      }
      return user;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    } finally {
      authStorage.clearTokens();
    }
  },

  // Employees
  async getEmployees(params: {
    page?: number;
    page_size?: number;
    q?: string;
    department?: string;
    status?: string;
  } = {}): Promise<EmployeeListResponse> {
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(page));
    if (params.page_size) query.set('page_size', String(pageSize));
    if (params.q) query.set('q', params.q);
    if (params.department) query.set('department', params.department);
    if (params.status) query.set('status', params.status);

    try {
      const res = await fetchWithAuth(`/employees?${query.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data.detail || 'Failed to fetch employees', data);
      }
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Seamless local store fallback
      let emps = getStoredEmployees();

      if (params.q && params.q.trim()) {
        const q = params.q.toLowerCase().trim();
        emps = emps.filter(
          (e) =>
            e.id.toLowerCase().includes(q) ||
            e.full_name.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q) ||
            e.job_title.toLowerCase().includes(q)
        );
      }

      if (params.department && params.department.trim()) {
        emps = emps.filter((e) => e.department === params.department);
      }

      if (params.status && params.status.trim()) {
        emps = emps.filter((e) => e.employment_status === params.status);
      }

      const total = emps.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const offset = (page - 1) * pageSize;
      const items = emps.slice(offset, offset + pageSize);

      return {
        items,
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
      };
    }
  },

  async getEmployee(id: string): Promise<Employee> {
    try {
      const res = await fetchWithAuth(`/employees/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data.detail || `Failed to fetch employee ${id}`, data);
      }
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      const emps = getStoredEmployees();
      const emp = emps.find((e) => e.id === id);
      if (!emp) {
        throw new ApiError(404, `Employee ${id} not found`);
      }
      return emp;
    }
  },

  async createEmployee(employeeData: EmployeeFormData): Promise<Employee> {
    const user = authStorage.getUser();
    if (user && user.role !== 'admin') {
      throw new ApiError(403, 'Access forbidden: Administrator privileges are required');
    }

    try {
      const res = await fetchWithAuth('/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        let message = data.detail || 'Failed to create employee';
        if (Array.isArray(data.detail)) {
          message = data.detail.map((d: any) => `${d.loc?.[1] || 'field'}: ${d.msg}`).join(', ');
        }
        throw new ApiError(res.status, message, data);
      }
      // Also update local cache
      const emps = getStoredEmployees();
      saveStoredEmployees([data, ...emps.filter((e) => e.id !== data.id)]);
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      const emps = getStoredEmployees();
      const duplicate = emps.find(
        (e) => e.email.toLowerCase() === employeeData.email.toLowerCase()
      );
      if (duplicate) {
        throw new ApiError(409, `An employee with email '${employeeData.email}' already exists`);
      }

      let maxNum = 1000;
      for (const e of emps) {
        const match = e.id.match(/^EMP-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }

      const newEmp: Employee = {
        id: `EMP-${maxNum + 1}`,
        full_name: employeeData.full_name,
        email: employeeData.email,
        phone_number: employeeData.phone_number,
        department: employeeData.department,
        job_title: employeeData.job_title,
        employment_status: employeeData.employment_status,
        date_of_joining: employeeData.date_of_joining,
        notes: employeeData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      saveStoredEmployees([newEmp, ...emps]);
      return newEmp;
    }
  },

  async updateEmployee(id: string, employeeData: Partial<EmployeeFormData>): Promise<Employee> {
    const user = authStorage.getUser();
    if (user && user.role !== 'admin') {
      throw new ApiError(403, 'Access forbidden: Administrator privileges are required');
    }

    try {
      const res = await fetchWithAuth(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        let message = data.detail || 'Failed to update employee';
        if (Array.isArray(data.detail)) {
          message = data.detail.map((d: any) => `${d.loc?.[1] || 'field'}: ${d.msg}`).join(', ');
        }
        throw new ApiError(res.status, message, data);
      }
      const emps = getStoredEmployees();
      saveStoredEmployees(emps.map((e) => (e.id === id ? data : e)));
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      const emps = getStoredEmployees();
      const idx = emps.findIndex((e) => e.id === id);
      if (idx === -1) {
        throw new ApiError(404, `Employee ${id} not found`);
      }

      if (employeeData.email) {
        const conflict = emps.find(
          (e) => e.email.toLowerCase() === employeeData.email?.toLowerCase() && e.id !== id
        );
        if (conflict) {
          throw new ApiError(409, `Another employee with email '${employeeData.email}' already exists`);
        }
      }

      const updated: Employee = {
        ...emps[idx],
        ...employeeData,
        updated_at: new Date().toISOString(),
      };

      emps[idx] = updated;
      saveStoredEmployees(emps);
      return updated;
    }
  },

  async deleteEmployee(id: string): Promise<{ message: string; deleted_id: string }> {
    const user = authStorage.getUser();
    if (user && user.role !== 'admin') {
      throw new ApiError(403, 'Access forbidden: Administrator privileges are required');
    }

    try {
      const res = await fetchWithAuth(`/employees/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data.detail || 'Failed to delete employee', data);
      }
      const emps = getStoredEmployees();
      saveStoredEmployees(emps.filter((e) => e.id !== id));
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      const emps = getStoredEmployees();
      const exists = emps.some((e) => e.id === id);
      if (!exists) {
        throw new ApiError(404, `Employee ${id} not found`);
      }
      saveStoredEmployees(emps.filter((e) => e.id !== id));
      return { message: `Employee ${id} deleted successfully`, deleted_id: id };
    }
  },

  async getStats(): Promise<EmployeeStats> {
    try {
      const res = await fetchWithAuth('/employees/stats/summary');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new ApiError(res.status, data.detail || 'Failed to fetch statistics', data);
      }
      return data;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      const emps = getStoredEmployees();
      const total = emps.length;
      const active = emps.filter((e) => e.employment_status === 'Active').length;
      const inactive = emps.filter((e) => e.employment_status === 'Inactive').length;

      const deptDist: Record<string, number> = {};
      for (const e of emps) {
        deptDist[e.department] = (deptDist[e.department] || 0) + 1;
      }

      return {
        total,
        active,
        inactive,
        departments_count: Object.keys(deptDist).length,
        department_distribution: deptDist,
      };
    }
  },
};
