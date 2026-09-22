import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn.js';

/** Sección plegable del panel de propiedades. */
export function PropSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn('prop-section', open && 'is-open')}>
      <button type="button" className="prop-section__header" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{title}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && <div className="prop-section__body">{children}</div>}
    </section>
  );
}

/** Fila etiqueta + control. */
export function PropRow({ label, children, full = false }) {
  return (
    <div className={cn('prop-row', full && 'prop-row--full')}>
      {label && <span className="prop-row__label">{label}</span>}
      <div className="prop-row__control">{children}</div>
    </div>
  );
}

/** Rejilla de 2 columnas con campos pequeños etiquetados (X, Y, Ancho…). */
export function PropGrid({ children }) {
  return <div className="prop-grid">{children}</div>;
}

export function PropField({ label, children }) {
  return (
    <label className="prop-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
