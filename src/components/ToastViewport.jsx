import { useToast } from '../hooks/useToast';

function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <button
          type="button"
          key={toast.id}
          className={`toast toast--${toast.variant}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast__dot" />
          <span>{toast.message}</span>
        </button>
      ))}
    </div>
  );
}

export default ToastViewport;
