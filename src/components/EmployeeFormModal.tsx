import React, { useState, useEffect } from 'react';
import { Employee, EmployeeFormData } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  initialData?: Employee | null;
  departments: string[];
}

const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
  'Product',
  'Sales',
  'Legal',
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    department: 'Engineering',
    job_title: '',
    employment_status: 'Active',
    date_of_joining: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        full_name: initialData.full_name,
        email: initialData.email,
        phone_number: initialData.phone_number,
        department: initialData.department,
        job_title: initialData.job_title,
        employment_status: initialData.employment_status,
        date_of_joining: initialData.date_of_joining,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        department: 'Engineering',
        job_title: '',
        employment_status: 'Active',
        date_of_joining: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address (e.g. employee@company.com)';
    }

    const phoneRegex = /^(\+?[0-9]{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?[\d\s.-]{5,15}$/;
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone_number.trim())) {
      newErrors.phone_number = 'Invalid phone format (e.g. +1-555-0199 or 555-0199)';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }

    if (!formData.date_of_joining) {
      newErrors.date_of_joining = 'Date of joining is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while saving employee');
    } finally {
      setSubmitting(false);
    }
  };

  const combinedDepts = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...departments]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-black w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              {isEditing ? `Edit Employee (${initialData?.id})` : 'New Employee Record'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEditing
                ? 'Update employee details and organizational information'
                : 'Fill in the information below to register a new employee record'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {serverError && (
            <div className="p-3 border border-black bg-zinc-100 text-black flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Full Name <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full px-3 py-1.5 border bg-white focus:outline-none focus:border-black transition-colors ${
                  errors.full_name ? 'border-black bg-zinc-50' : 'border-zinc-300'
                }`}
              />
              {errors.full_name && <p className="text-[11px] text-zinc-700 font-medium mt-1">⚠ {errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Email Address <span className="text-black">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. sarah.j@company.com"
                className={`w-full px-3 py-1.5 border bg-white focus:outline-none focus:border-black transition-colors ${
                  errors.email ? 'border-black bg-zinc-50' : 'border-zinc-300'
                }`}
              />
              {errors.email && <p className="text-[11px] text-zinc-700 font-medium mt-1">⚠ {errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Phone Number <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="e.g. +1-555-0101"
                className={`w-full px-3 py-1.5 border bg-white focus:outline-none focus:border-black transition-colors ${
                  errors.phone_number ? 'border-black bg-zinc-50' : 'border-zinc-300'
                }`}
              />
              {errors.phone_number && <p className="text-[11px] text-zinc-700 font-medium mt-1">⚠ {errors.phone_number}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Department <span className="text-black">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 border border-zinc-300 bg-white focus:outline-none focus:border-black"
              >
                {combinedDepts.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-[11px] text-zinc-700 font-medium mt-1">⚠ {errors.department}</p>}
            </div>

            {/* Job Title */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Job Title <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full px-3 py-1.5 border bg-white focus:outline-none focus:border-black transition-colors ${
                  errors.job_title ? 'border-black bg-zinc-50' : 'border-zinc-300'
                }`}
              />
              {errors.job_title && <p className="text-[11px] text-zinc-700 font-medium mt-1">⚠ {errors.job_title}</p>}
            </div>

            {/* Employment Status */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Employment Status <span className="text-black">*</span>
              </label>
              <div className="flex items-center space-x-4 pt-1.5">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="employment_status"
                    value="Active"
                    checked={formData.employment_status === 'Active'}
                    onChange={() => setFormData({ ...formData, employment_status: 'Active' })}
                    className="accent-black"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="employment_status"
                    value="Inactive"
                    checked={formData.employment_status === 'Inactive'}
                    onChange={() => setFormData({ ...formData, employment_status: 'Inactive' })}
                    className="accent-black"
                  />
                  <span>Inactive</span>
                </label>
              </div>
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block font-semibold text-zinc-800 mb-1">
                Date of Joining <span className="text-black">*</span>
              </label>
              <input
                type="date"
                value={formData.date_of_joining}
                onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                className={`w-full px-3 py-1.5 border bg-white focus:outline-none focus:border-black transition-colors ${
                  errors.date_of_joining ? 'border-black bg-zinc-50' : 'border-zinc-300'
                }`}
              />
              {errors.date_of_joining && <p className="text-[11px] text-zinc-700 font-medium mt-1">⚠ {errors.date_of_joining}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-800 mb-1">
              Internal Notes / Remarks <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add organizational remarks, project assignments, or onboarding notes..."
              className="w-full px-3 py-1.5 border border-zinc-300 bg-white focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:border-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-black text-white hover:bg-zinc-800 font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
