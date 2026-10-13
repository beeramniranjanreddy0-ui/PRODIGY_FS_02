import React from 'react';
import { Employee } from '../types';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  employee,
  isOpen,
  onClose,
  onConfirm,
  deleting,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-black w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-4 h-4 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Delete Employee Record
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-start space-x-3 p-3 border border-zinc-300 bg-zinc-50 text-zinc-800">
            <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-black">Confirm Permanent Deletion</p>
              <p className="text-zinc-600">
                Are you sure you want to permanently delete this employee record from the database? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="border border-zinc-200 p-3 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Employee ID:</span>
              <span className="font-mono font-bold text-black">{employee.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Full Name:</span>
              <span className="font-semibold text-black">{employee.full_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Department:</span>
              <span className="text-zinc-700">{employee.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Job Title:</span>
              <span className="text-zinc-700">{employee.job_title}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:border-black transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-black text-white hover:bg-zinc-800 font-medium disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting Record...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
