import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 border shadow-lg flex items-start space-x-2.5 text-xs transition-all duration-200 ${
            toast.type === 'error'
              ? 'border-black bg-zinc-900 text-white'
              : 'border-black bg-white text-black'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          ) : (
            <Check className="w-4 h-4 text-black shrink-0 mt-0.5" />
          )}

          <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>

          <button
            onClick={() => onDismiss(toast.id)}
            className={`p-0.5 transition-colors ${
              toast.type === 'error'
                ? 'text-zinc-400 hover:text-white'
                : 'text-zinc-400 hover:text-black'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
