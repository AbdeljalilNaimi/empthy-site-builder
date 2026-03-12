import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle, 
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: "border-green-500/20 bg-green-50/90 text-green-900",
  error: "border-red-500/20 bg-red-50/90 text-red-900",
  info: "border-blue-500/20 bg-blue-50/90 text-blue-900", 
  warning: "border-yellow-500/20 bg-yellow-50/90 text-yellow-900",
};

export const NotificationToast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  const Icon = toastIcons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        "glass-card p-4 rounded-lg border shadow-lg max-w-sm w-full",
        "animate-slide-down transform transition-all duration-300",
        toastStyles[type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && (
            <p className="text-xs mt-1 opacity-90">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;