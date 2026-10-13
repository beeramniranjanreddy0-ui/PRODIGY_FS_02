import React from 'react';
import { Employee } from '../types';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  UserX
} from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  searchQuery: string;
  selectedDepartment: string;
  selectedStatus: string;
  departments: string[];
  isAdmin: boolean;
  onSearchChange: (q: string) => void;
  onDepartmentChange: (dept: string) => void;
  onStatusChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
  onAddEmployee: () => void;
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
  onExportCsv: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  total,
  page,
  pageSize,
  totalPages,
  loading,
  searchQuery,
  selectedDepartment,
  selectedStatus,
  departments,
  isAdmin,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onAddEmployee,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onExportCsv,
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="border border-zinc-200 bg-white">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID, name, email, department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-200 focus:outline-none focus:border-black bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="py-1.5 px-2 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-black"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center border border-zinc-200 text-xs">
            {['', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`px-2.5 py-1 transition-colors ${
                  selectedStatus === status
                    ? 'bg-black text-white font-medium'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            title="Refresh record list"
            className="p-1.5 border border-zinc-200 text-zinc-600 hover:border-black hover:text-black transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            title="Export records to CSV"
            className="flex items-center space-x-1 px-2.5 py-1.5 border border-zinc-200 text-zinc-700 hover:border-black hover:text-black text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Employee Button */}
          <button
            onClick={onAddEmployee}
            className="flex items-center space-x-1 px-3 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
              <th className="py-3 px-4 font-semibold">ID</th>
              <th className="py-3 px-4 font-semibold">Name & Contact</th>
              <th className="py-3 px-4 font-semibold">Department</th>
              <th className="py-3 px-4 font-semibold">Job Title</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Joined Date</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-zinc-100" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-32 bg-zinc-100 mb-1" /><div className="h-3 w-40 bg-zinc-100" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-zinc-100" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-zinc-100" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-12 bg-zinc-100" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-zinc-100" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-16 bg-zinc-100 ml-auto" /></td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  <UserX className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  <p className="font-medium text-zinc-800 text-sm">No employee records found</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {searchQuery || selectedDepartment || selectedStatus
                      ? 'Try adjusting your search criteria or resetting filters'
                      : 'Create your first employee record using the Add Employee button above'}
                  </p>
                </td>
              </tr>
            ) : (
              // Employee Rows
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-black">{emp.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-black">{emp.full_name}</div>
                    <div className="text-zinc-500 text-[11px]">{emp.email}</div>
                    <div className="text-zinc-400 text-[11px]">{emp.phone_number}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 font-medium">{emp.department}</td>
                  <td className="py-3 px-4 text-zinc-600">{emp.job_title}</td>
                  <td className="py-3 px-4">
                    {emp.employment_status === 'Active' ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-black text-white">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border border-zinc-300 text-zinc-600 bg-white">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">{emp.date_of_joining}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => onViewEmployee(emp)}
                        title="View employee details"
                        className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditEmployee(emp)}
                        title={isAdmin ? "Edit employee details" : "Requires Administrator role"}
                        className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(emp)}
                        title={isAdmin ? "Delete employee record" : "Requires Administrator role"}
                        className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
        <div className="flex items-center space-x-2">
          <span>
            Showing <strong className="font-semibold text-black">{startItem}</strong> to{' '}
            <strong className="font-semibold text-black">{endItem}</strong> of{' '}
            <strong className="font-semibold text-black">{total}</strong> records
          </span>
          <span className="text-zinc-300">|</span>
          <div className="flex items-center space-x-1">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-zinc-200 bg-white px-1.5 py-0.5 text-xs focus:outline-none focus:border-black"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-zinc-500">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1 border border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1 border border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
