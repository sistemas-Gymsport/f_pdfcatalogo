import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ToastContainer } from '../components/ui/Toast.jsx';

const ToastContext = createContext(null);

const DURATION = { success: 3000, info: 3500, warning: 5000, error: 6000 };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (type, message, options = {}) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, type, message, title: options.title }]);
      setTimeout(() => dismiss(id), options.duration ?? DURATION[type]);
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      info: (message, options) => show('info', message, options),
      warning: (message, options) => show('warning', message, options),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return context;
}
