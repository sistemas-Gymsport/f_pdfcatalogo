import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Input } from './Input.jsx';
import './Controls.css';

/** Buscador con botón para limpiar. */
export function SearchInput({ value, onChange, placeholder = 'Buscar…', className }) {
  return (
    <div className={cn('search', className)}>
      <Input icon={Search} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
      {value && (
        <button type="button" className="search__clear" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Grupo de botones excluyentes (alineación, ajuste de imagen…).
 * options: [{ value, label, icon, tooltip }]
 */
export function SegmentedControl({ value, onChange, options, size = 'sm', ariaLabel, block = false }) {
  return (
    <div className={cn('segmented', `segmented--${size}`, block && 'segmented--block')} role="radiogroup" aria-label={ariaLabel}>
      {options.map(({ value: optionValue, label, icon: Icon, tooltip }) => (
        <button
          key={optionValue}
          type="button"
          role="radio"
          aria-checked={value === optionValue}
          aria-label={tooltip || label}
          className={cn('segmented__option', value === optionValue && 'is-selected')}
          data-tooltip={tooltip}
          onClick={() => onChange(optionValue)}
        >
          {Icon && <Icon size={15} aria-hidden="true" />}
          {label && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}

/** Interruptor on/off accesible. */
export function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <label className={cn('switch', disabled && 'is-disabled')}>
      <span className="switch__text">
        <span className="switch__label">{label}</span>
        {description && <span className="switch__description">{description}</span>}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
    </label>
  );
}

/** Etiqueta pequeña de estado. tone: neutral | success | warning | danger | accent */
export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

/** Tarjeta contenedora con cabecera opcional. */
export function Card({ title, description, actions, children, className, padded = true }) {
  return (
    <section className={cn('card', className)}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {description && <p className="card__description">{description}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'card__body' : undefined}>{children}</div>
    </section>
  );
}
