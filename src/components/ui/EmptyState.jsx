import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';
import './EmptyState.css';

/** Estado vacío con icono, texto y acción opcional. */
export function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <div className={compact ? 'empty empty--compact' : 'empty'}>
      {Icon && (
        <div className="empty__icon">
          <Icon size={compact ? 22 : 28} aria-hidden="true" />
        </div>
      )}
      <h3 className="empty__title">{title}</h3>
      {description && <p className="empty__description">{description}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

/** Estado de error con opción de reintentar. */
export function ErrorState({ title = 'No se pudo cargar la información', error, onRetry }) {
  return (
    <div className="empty empty--error" role="alert">
      <div className="empty__icon">
        <AlertTriangle size={26} aria-hidden="true" />
      </div>
      <h3 className="empty__title">{title}</h3>
      {error?.message && <p className="empty__description">{error.message}</p>}
      {onRetry && (
        <div className="empty__action">
          <Button onClick={onRetry}>Reintentar</Button>
        </div>
      )}
    </div>
  );
}
