import React from 'react';
import { Employee } from '../types';
import { X, Mail, Phone, Building2, Briefcase, Calendar, Clock, Edit2 } from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
  isAdmin: boolean;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit,
  isAdmin,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-black w-full max-w-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5">
                {employee.id}
              </span>
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Record Details
              </span>
            </div>
            <h2 className="text-base font-bold text-black mt-1">{employee.full_name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-4 border border-zinc-200 p-4 bg-zinc-50/50">
            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Status
              </span>
              <div className="mt-1">
                {employee.employment_status === 'Active' ? (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase bg-black text-white">
                    Active Duty
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase border border-zinc-300 text-zinc-600 bg-white">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Department
              </span>
              <p className="mt-1 font-semibold text-black">{employee.department}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Job Title
              </span>
              <p className="mt-1 text-zinc-800 font-medium">{employee.job_title}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Date Joined
              </span>
              <p className="mt-1 font-mono text-zinc-800">{employee.date_of_joining}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 border-t border-zinc-200 pt-3">
            <h3 className="font-semibold text-black text-xs uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="flex items-center space-x-2 text-zinc-700">
              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-zinc-700">
              <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{employee.phone_number}</span>
            </div>
          </div>

          {/* Notes */}
          {employee.notes && (
            <div className="space-y-1.5 border-t border-zinc-200 pt-3">
              <h3 className="font-semibold text-black text-xs uppercase tracking-wider">
                Notes & Remarks
              </h3>
              <p className="text-zinc-600 bg-zinc-50 border border-zinc-200 p-2.5 whitespace-pre-wrap leading-relaxed">
                {employee.notes}
              </p>
            </div>
          )}

          {/* Metadata timestamps */}
          <div className="space-y-1 border-t border-zinc-200 pt-3 text-[11px] text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-zinc-300" />
              <span>Created at: {new Date(employee.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-zinc-300" />
              <span>Last updated: {new Date(employee.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          {isAdmin ? (
            <button
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 border border-zinc-300 hover:border-black text-black text-xs font-medium transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
