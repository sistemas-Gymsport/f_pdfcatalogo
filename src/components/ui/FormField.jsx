import { cloneElement, isValidElement, useId } from 'react';
import { cn } from '../../utils/cn.js';
import './FormField.css';

/**
 * Envoltorio de campo: etiqueta, ayuda y error. Conecta automáticamente
 * id / aria-describedby / aria-invalid con el control hijo.
 */
export function FormField({ label, hint, error, required, className, children, inline = false }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        invalid: error ? true : undefined,
      })
    : children;

  return (
    <div className={cn('field', inline && 'field--inline', error && 'field--error', className)}>
      {label && (
        <label className="field__label" htmlFor={children?.props?.id || id}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {control}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
