import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';
import './Modal.css';

/**
 * Modal accesible: se cierra con Escape o clic en el fondo (si no está bloqueado).
 * size: sm | md | lg | xl
 */
export function Modal({ open, onClose, title, description, size = 'md', footer, children, locked = false, className }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !locked) {
        event.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const target = dialogRef.current?.querySelector('[data-autofocus]') || dialogRef.current;
      target?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, locked, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !locked && onClose?.()}>
      <div
        ref={dialogRef}
        className={cn('modal', `modal--${size}`, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          {!locked && <Button variant="ghost" size="sm" icon={X} tooltip="Cerrar" onClick={onClose} />}
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
