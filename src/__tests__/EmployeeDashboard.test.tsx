import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { StatsCards } from '../components/StatsCards';
import { Employee } from '../types';

const mockEmployees: Employee[] = [
  {
    id: 'EMP-1001',
    full_name: 'Sarah Jenkins',
    email: 'sarah.jenkins@prodigy.com',
    phone_number: '+1-555-0101',
    department: 'Engineering',
    job_title: 'Lead Software Engineer',
    employment_status: 'Active',
    date_of_joining: '2023-02-15',
    notes: 'Platform lead',
    created_at: '2023-02-15T00:00:00Z',
    updated_at: '2023-02-15T00:00:00Z',
  },
  {
    id: 'EMP-1002',
    full_name: 'Michael Chen',
    email: 'michael.chen@prodigy.com',
    phone_number: '+1-555-0102',
    department: 'Marketing',
    job_title: 'Marketing Specialist',
    employment_status: 'Inactive',
    date_of_joining: '2023-06-01',
    notes: null,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-01T00:00:00Z',
  },
];

describe('StatsCards Component', () => {
  it('renders employee statistics counters correctly', () => {
    const mockStats = {
      total: 15,
      active: 12,
      inactive: 3,
      departments_count: 4,
      department_distribution: { Engineering: 10, Marketing: 5 },
    };

    render(<StatsCards stats={mockStats} loading={false} />);
    expect(screen.getByText('TOTAL EMPLOYEES')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('EmployeeTable Component', () => {
  it('renders employee rows with details and status badges', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        total={2}
        page={1}
        pageSize={10}
        totalPages={1}
        loading={false}
        searchQuery=""
        selectedDepartment=""
        selectedStatus=""
        departments={['Engineering', 'Marketing']}
        isAdmin={true}
        onSearchChange={vi.fn()}
        onDepartmentChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onRefresh={vi.fn()}
        onAddEmployee={vi.fn()}
        onViewEmployee={vi.fn()}
        onEditEmployee={vi.fn()}
        onDeleteEmployee={vi.fn()}
        onExportCsv={vi.fn()}
      />
    );

    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('EMP-1001')).toBeInTheDocument();
    expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    expect(screen.getByText('EMP-1002')).toBeInTheDocument();
  });

  it('renders empty state when no employees match filters', () => {
    render(
      <EmployeeTable
        employees={[]}
        total={0}
        page={1}
        pageSize={10}
        totalPages={1}
        loading={false}
        searchQuery="nonexistent"
        selectedDepartment=""
        selectedStatus=""
        departments={[]}
        isAdmin={true}
        onSearchChange={vi.fn()}
        onDepartmentChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onRefresh={vi.fn()}
        onAddEmployee={vi.fn()}
        onViewEmployee={vi.fn()}
        onEditEmployee={vi.fn()}
        onDeleteEmployee={vi.fn()}
        onExportCsv={vi.fn()}
      />
    );

    expect(screen.getByText('No employee records found')).toBeInTheDocument();
  });
});

describe('EmployeeFormModal Validation', () => {
  it('displays field-level errors when submitting invalid empty fields', async () => {
    const handleSubmit = vi.fn();
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        initialData={null}
        departments={['Engineering']}
      />
    );

    // Click submit without entering required name or email
    const submitBtn = screen.getByText('Create Record');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Email address is required/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validates email format properly', async () => {
    const handleSubmit = vi.fn();
    render(
      <EmployeeFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        initialData={null}
        departments={['Engineering']}
      />
    );

    const emailInput = screen.getByPlaceholderText('e.g. sarah.j@company.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email-string' } });

    const submitBtn = screen.getByText('Create Record');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email address/i)).toBeInTheDocument();
    });
  });
});

describe('DeleteConfirmModal Component', () => {
  it('displays confirmation details and triggers deletion on confirm', async () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <DeleteConfirmModal
        employee={mockEmployees[0]}
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        deleting={false}
      />
    );

    expect(screen.getByText('Confirm Permanent Deletion')).toBeInTheDocument();
    expect(screen.getByText('EMP-1001')).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();

    const deleteBtn = screen.getByText('Confirm Delete');
    fireEvent.click(deleteBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
