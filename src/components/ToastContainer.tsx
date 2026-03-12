import { createPortal } from 'react-dom';
import { NotificationToast, ToastProps } from './NotificationToast';

interface ToastContainerProps {
  toasts: ToastProps[];
}

export const ToastContainer = ({ toasts }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <NotificationToast key={toast.id} {...toast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;