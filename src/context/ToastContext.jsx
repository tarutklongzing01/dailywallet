import { createContext, useState } from 'react';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  const pushToast = (message, variant = 'info') => {
    const toastId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

    setToasts((current) => [
      ...current,
      {
        id: toastId,
        message,
        variant,
      },
    ]);

    window.setTimeout(() => {
      removeToast(toastId);
    }, 3600);
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        removeToast,
        success: (message) => pushToast(message, 'success'),
        error: (message) => pushToast(message, 'error'),
        info: (message) => pushToast(message, 'info'),
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}
