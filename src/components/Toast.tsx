import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { removeToast, selectToasts } from '../store/toastSlice';
import type { Toast as ToastModel } from '../store/toastSlice';

const TYPE_STYLES: Record<ToastModel['type'], { bar: string; icon: string }> = {
  success: { bar: 'border-l-green-500', icon: 'check_circle' },
  error: { bar: 'border-l-red-500', icon: 'error' },
  info: { bar: 'border-l-blue-500', icon: 'info' },
};

const ICON_COLORS: Record<ToastModel['type'], string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

function ToastItem({ toast }: { toast: ToastModel }) {
  const dispatch = useAppDispatch();

  // Automatikus eltüntetés 3.5 mp után (mellékhatás → useEffect).
  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 3500);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  const style = TYPE_STYLES[toast.type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 w-72 max-w-[90vw] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-lg rounded-md border-l-4 ${style.bar} px-3 py-2.5 animate-[fadeIn_0.2s_ease-out]`}
    >
      <span className={`material-icons text-[18px] ${ICON_COLORS[toast.type]}`}>{style.icon}</span>
      <span className="text-sm flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Bezárás"
      >
        <span className="material-icons text-[16px]">close</span>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useAppSelector(selectToasts);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
