import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import './Toast.css';

const ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
            <Icon size={18} className="toast__icon" aria-hidden="true" />
            <div className="toast__body">
              {toast.title && <strong>{toast.title}</strong>}
              <span>{toast.message}</span>
            </div>
            <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Cerrar notificación">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
