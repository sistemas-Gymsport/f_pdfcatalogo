import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { Spinner } from './Loading.jsx';
import './Button.css';

/**
 * Botón único de la aplicación.
 * - variant: primary | secondary | ghost | danger | subtle
 * - size: sm | md | lg
 * - icon: componente de lucide-react
 * - tooltip: texto de ayuda (obligatorio si el botón solo tiene icono)
 * - to: si se indica, se renderiza como enlace de react-router
 */
export const Button = forwardRef(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    tooltip,
    tooltipPosition = 'bottom',
    active = false,
    block = false,
    to,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const iconOnly = !children && Icon;
  const classes = cn(
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    iconOnly && 'btn--icon',
    active && 'is-active',
    block && 'btn--block',
    tooltip && 'has-tooltip',
    className,
  );
  const content = (
    <>
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : Icon && <Icon size={size === 'sm' ? 15 : 17} aria-hidden="true" />}
      {children && <span className="btn__label">{children}</span>}
      {IconRight && <IconRight size={16} aria-hidden="true" />}
    </>
  );
  const common = {
    className: classes,
    'data-tooltip': tooltip,
    'data-tooltip-pos': tooltip ? tooltipPosition : undefined,
    'aria-label': iconOnly ? tooltip : undefined,
    ...props,
  };

  if (to && !disabled) {
    return (
      <Link ref={ref} to={to} {...common}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} {...common}>
      {content}
    </button>
  );
});
