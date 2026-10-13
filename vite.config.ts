/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// In-memory data store for Vite dev server API handling
const initialEmployees = [
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

let employeesStore = [...initialEmployees];
let usersStore = [
  {
    id: 1,
    email: 'admin@prodigy.com',
    username: 'Administrator',
    role: 'admin',
    is_active: true,
    created_at: new Date(2026, 0, 1).toISOString(),
  },
];

const ADMIN_SECRET_CODE = 'PRODIGY@2026';

function emsApiPlugin(): Plugin {
  return {
    name: 'ems-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api')) {
          return next();
        }

        const method = req.method || 'GET';
        const [pathname, search] = url.split('?');
        const query = new URLSearchParams(search || '');

        res.setHeader('Content-Type', 'application/json');

        const sendJson = (status: number, data: any) => {
          res.statusCode = status;
          res.end(JSON.stringify(data));
        };

        const readBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        // All authenticated sessions operate as Administrator
        const isAdmin = true;

        try {
          // 1. Health
          if (pathname === '/api/health') {
            return sendJson(200, {
              status: 'healthy',
              service: 'Prodigy Infotech EMS API',
              timestamp: new Date().toISOString(),
            });
          }

          // 2. Auth Login
          if (pathname === '/api/auth/login' && method === 'POST') {
            const body = await readBody();
            const email = (body.email || '').trim().toLowerCase();
            const password = body.password || '';
            const secretCode = body.secret_code;

            // Enforce secret code verification for all Administrator logins
            if (!secretCode || secretCode !== ADMIN_SECRET_CODE) {
              return sendJson(403, {
                detail: 'Invalid Administrator Secret Code! Verification failed.',
              });
            }

            let matchedUser = usersStore.find((u) => u.email.toLowerCase() === email);

            if (!matchedUser) {
              matchedUser = {
                id: Date.now(),
                email: email || 'admin@prodigy.com',
                username: 'Administrator',
                role: 'admin',
                is_active: true,
                created_at: new Date().toISOString(),
              };
              usersStore.push(matchedUser);
            }

            // Verify password if admin@prodigy.com
            if (email === 'admin@prodigy.com' && password && password !== 'AdminPassword@2026') {
              return sendJson(401, { detail: 'Invalid email or password' });
            }

            return sendJson(200, {
              access_token: `jwt_access_token_admin_${Date.now()}`,
              refresh_token: `jwt_refresh_token_admin_${Date.now()}`,
              token_type: 'bearer',
              user: matchedUser,
            });
          }

          // 3. Auth Register
          if (pathname === '/api/auth/register' && method === 'POST') {
            const body = await readBody();
            const email = (body.email || '').trim().toLowerCase();
            const secretCode = body.secret_code;

            // Enforce secret code for creating admin accounts
            if (secretCode !== ADMIN_SECRET_CODE) {
              return sendJson(403, {
                detail: 'Invalid Administrator Secret Code! Authorization required to create an Admin account.',
              });
            }

            if (usersStore.some((u) => u.email.toLowerCase() === email)) {
              return sendJson(409, { detail: 'A user with this email address already exists' });
            }

            const newUser = {
              id: usersStore.length + 1,
              email,
              username: body.username || 'Administrator',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
            };
            usersStore.push(newUser);

            return sendJson(201, {
              access_token: `jwt_access_token_${newUser.role}_${Date.now()}`,
              refresh_token: `jwt_refresh_token_${newUser.role}_${Date.now()}`,
              token_type: 'bearer',
              user: newUser,
            });
          }

          // 4. Auth Me
          if (pathname === '/api/auth/me' && method === 'GET') {
            const user = isAdmin ? usersStore[0] : usersStore[1];
            return sendJson(200, user);
          }

          // 5. Auth Logout
          if (pathname === '/api/auth/logout' && method === 'POST') {
            return sendJson(200, { message: 'Logged out successfully' });
          }

          // 6. Auth Refresh
          if (pathname === '/api/auth/refresh' && method === 'POST') {
            return sendJson(200, {
              access_token: `jwt_access_token_refreshed_${Date.now()}`,
              token_type: 'bearer',
            });
          }

          // 7. Employee Stats Summary
          if (pathname === '/api/employees/stats/summary' && method === 'GET') {
            const total = employeesStore.length;
            const active = employeesStore.filter((e) => e.employment_status === 'Active').length;
            const inactive = employeesStore.filter((e) => e.employment_status === 'Inactive').length;

            const deptDist: Record<string, number> = {};
            for (const emp of employeesStore) {
              deptDist[emp.department] = (deptDist[emp.department] || 0) + 1;
            }

            return sendJson(200, {
              total,
              active,
              inactive,
              departments_count: Object.keys(deptDist).length,
              department_distribution: deptDist,
            });
          }

          // 8. Employees List (GET /api/employees)
          if (pathname === '/api/employees' && method === 'GET') {
            const page = parseInt(query.get('page') || '1', 10);
            const pageSize = parseInt(query.get('page_size') || '10', 10);
            const q = (query.get('q') || '').trim().toLowerCase();
            const department = query.get('department') || '';
            const status = query.get('status') || '';

            let filtered = [...employeesStore];

            if (q) {
              filtered = filtered.filter(
                (e) =>
                  e.id.toLowerCase().includes(q) ||
                  e.full_name.toLowerCase().includes(q) ||
                  e.email.toLowerCase().includes(q) ||
                  e.department.toLowerCase().includes(q) ||
                  e.job_title.toLowerCase().includes(q)
              );
            }

            if (department) {
              filtered = filtered.filter((e) => e.department === department);
            }

            if (status) {
              filtered = filtered.filter((e) => e.employment_status === status);
            }

            const total = filtered.length;
            const totalPages = Math.ceil(total / pageSize) || 1;
            const offset = (page - 1) * pageSize;
            const items = filtered.slice(offset, offset + pageSize);

            return sendJson(200, {
              items,
              total,
              page,
              page_size: pageSize,
              total_pages: totalPages,
            });
          }

          // 9. Create Employee (POST /api/employees)
          if (pathname === '/api/employees' && method === 'POST') {
            if (!isAdmin) {
              return sendJson(403, {
                detail: 'Access forbidden: Administrator privileges are required to perform this action',
              });
            }

            const body = await readBody();
            const email = (body.email || '').trim().toLowerCase();

            if (employeesStore.some((e) => e.email.toLowerCase() === email)) {
              return sendJson(409, {
                detail: `An employee with email '${body.email}' already exists in the system`,
              });
            }

            let maxNum = 1000;
            for (const emp of employeesStore) {
              const match = emp.id.match(/^EMP-(\d+)$/);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
              }
            }

            const newEmployee = {
              id: `EMP-${maxNum + 1}`,
              full_name: body.full_name || '',
              email: body.email || '',
              phone_number: body.phone_number || '',
              department: body.department || '',
              job_title: body.job_title || '',
              employment_status: body.employment_status || 'Active',
              date_of_joining: body.date_of_joining || new Date().toISOString().split('T')[0],
              notes: body.notes || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            employeesStore.unshift(newEmployee);
            return sendJson(201, newEmployee);
          }

          // 10. Single Employee Operations: GET, PUT, DELETE /api/employees/:id
          const empMatch = pathname.match(/^\/api\/employees\/([^\/]+)$/);
          if (empMatch) {
            const empId = decodeURIComponent(empMatch[1]);
            const empIndex = employeesStore.findIndex((e) => e.id === empId);

            if (method === 'GET') {
              if (empIndex === -1) {
                return sendJson(404, { detail: `Employee record with ID '${empId}' was not found` });
              }
              return sendJson(200, employeesStore[empIndex]);
            }

            if (method === 'PUT') {
              if (!isAdmin) {
                return sendJson(403, {
                  detail: 'Access forbidden: Administrator privileges are required to perform this action',
                });
              }
              if (empIndex === -1) {
                return sendJson(404, { detail: `Employee record with ID '${empId}' was not found` });
              }

              const body = await readBody();
              if (body.email && body.email.toLowerCase() !== employeesStore[empIndex].email.toLowerCase()) {
                const conflict = employeesStore.find(
                  (e) => e.email.toLowerCase() === body.email.toLowerCase() && e.id !== empId
                );
                if (conflict) {
                  return sendJson(409, {
                    detail: `Another employee with email '${body.email}' already exists`,
                  });
                }
              }

              const updatedEmp = {
                ...employeesStore[empIndex],
                ...body,
                id: empId,
                updated_at: new Date().toISOString(),
              };
              employeesStore[empIndex] = updatedEmp;
              return sendJson(200, updatedEmp);
            }

            if (method === 'DELETE') {
              if (!isAdmin) {
                return sendJson(403, {
                  detail: 'Access forbidden: Administrator privileges are required to perform this action',
                });
              }
              if (empIndex === -1) {
                return sendJson(404, { detail: `Employee record with ID '${empId}' was not found` });
              }

              employeesStore.splice(empIndex, 1);
              return sendJson(200, {
                message: `Employee ${empId} deleted successfully`,
                deleted_id: empId,
              });
            }
          }

          return sendJson(404, { detail: 'Endpoint not found' });
        } catch (err: any) {
          return sendJson(500, { detail: err.message || 'Internal server error' });
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), emsApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
});
