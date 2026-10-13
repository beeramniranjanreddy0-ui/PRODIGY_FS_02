/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api, authStorage, ApiError } from './api';
import { Employee, EmployeeFormData, EmployeeStats, User } from './types';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuthModal } from './components/AuthModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getUser());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  
  // Table states
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check Administrator authentication on mount
  useEffect(() => {
    async function initAuth() {
      const storedUser = authStorage.getUser();
      if (!storedUser || storedUser.role !== 'admin') {
        setIsAuthOpen(true);
        return;
      }
      try {
        const user = await api.getCurrentUser();
        if (user.role !== 'admin') {
          setIsAuthOpen(true);
        } else {
          setCurrentUser(user);
        }
      } catch {
        setIsAuthOpen(true);
      }
    }

    initAuth();
  }, []);

  // Fetch employees and stats
  const fetchEmployeesData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.allSettled([
        api.getEmployees({
          page,
          page_size: pageSize,
          q: searchQuery,
          department: selectedDepartment,
          status: selectedStatus,
        }),
        api.getStats(),
      ]);

      if (empRes.status === 'fulfilled') {
        setEmployees(empRes.value.items);
        setTotal(empRes.value.total);
        setTotalPages(empRes.value.total_pages);
      } else {
        const err = empRes.reason;
        if (err instanceof ApiError && err.status === 401) {
          setIsAuthOpen(true);
        } else {
          addToast('error', err.message || 'Failed to fetch employee records');
        }
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, selectedDepartment, selectedStatus]);

  useEffect(() => {
    if (currentUser) {
      fetchEmployeesData();
    }
  }, [fetchEmployeesData, currentUser]);

  // Handlers
  const handleLogout = async () => {
    await api.logout();
    authStorage.clearTokens();
    setCurrentUser(null);
    setEmployees([]);
    setStats(null);
    setIsAuthOpen(true);
    addToast('info', 'Logged out successfully. Please re-enter secret code to sign in.');
  };

  const handleQuickLogin = async () => {
    setIsAuthOpen(true);
  };

  const handleFormSubmit = async (formData: EmployeeFormData) => {
    if (editingEmployee) {
      const updated = await api.updateEmployee(editingEmployee.id, formData);
      addToast('success', `Employee ${updated.id} (${updated.full_name}) updated successfully`);
    } else {
      const created = await api.createEmployee(formData);
      addToast('success', `Employee ${created.id} (${created.full_name}) created successfully`);
    }
    fetchEmployeesData();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      await api.deleteEmployee(deletingEmployee.id);
      addToast('success', `Employee record ${deletingEmployee.id} deleted successfully`);
      setDeletingEmployee(null);
      fetchEmployeesData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete employee record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (employees.length === 0) {
      addToast('info', 'No records available to export');
      return;
    }

    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Department', 'Job Title', 'Status', 'Date Joined'];
    const rows = employees.map((emp) => [
      emp.id,
      `"${emp.full_name.replace(/"/g, '""')}"`,
      emp.email,
      emp.phone_number,
      `"${emp.department}"`,
      `"${emp.job_title}"`,
      emp.employment_status,
      emp.date_of_joining,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Employee list exported to CSV');
  };

  const departmentsList = stats
    ? Object.keys(stats.department_distribution)
    : ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Product'];

  // All authorized operations in this web application are performed with Administrator privileges
  const isAdmin = true;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Title & Overview */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">
                Employee Management
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Centralized directory, employee records administration, and personnel management.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Employee Records Table & Controls */}
        <EmployeeTable
          employees={employees}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          loading={loading}
          searchQuery={searchQuery}
          selectedDepartment={selectedDepartment}
          selectedStatus={selectedStatus}
          departments={departmentsList}
          isAdmin={isAdmin}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          onDepartmentChange={(dept) => {
            setSelectedDepartment(dept);
            setPage(1);
          }}
          onStatusChange={(st) => {
            setSelectedStatus(st);
            setPage(1);
          }}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
          onRefresh={fetchEmployeesData}
          onAddEmployee={() => {
            setEditingEmployee(null);
            setIsFormOpen(true);
          }}
          onViewEmployee={(emp) => setViewingEmployee(emp)}
          onEditEmployee={(emp) => {
            setEditingEmployee(emp);
            setIsFormOpen(true);
          }}
          onDeleteEmployee={(emp) => setDeletingEmployee(emp)}
          onExportCsv={handleExportCsv}
        />
      </main>



      {/* Modals & Dialogs */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        departments={departmentsList}
      />

      <EmployeeDetailModal
        isOpen={Boolean(viewingEmployee)}
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={(emp) => {
          setEditingEmployee(emp);
          setIsFormOpen(true);
        }}
        isAdmin={isAdmin}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingEmployee)}
        employee={deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDeleteConfirm}
        deleting={isDeleting}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          addToast('success', `Authenticated as ${user.email} (ADMINISTRATOR)`);
          fetchEmployeesData();
        }}
      />

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
