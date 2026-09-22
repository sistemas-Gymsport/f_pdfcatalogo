import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';
import './FormField.css';

/** Input de texto con icono opcional a la izquierda y sufijo (unidad) a la derecha. */
export const Input = forwardRef(function Input({ icon: Icon, suffix, invalid, size, className, ...props }, ref) {
  const input = (
    <input
      ref={ref}
      className={cn('control', size === 'sm' && 'control--sm', invalid && 'control--invalid', className)}
      {...props}
    />
  );
  if (!Icon && !suffix) return input;
  return (
    <div className={cn('input-wrap', Icon && 'input-wrap--icon', suffix && 'input-wrap--suffix')}>
      {Icon && (
        <span className="input-wrap__icon">
          <Icon size={16} aria-hidden="true" />
        </span>
      )}
      {input}
      {suffix && <span className="input-wrap__suffix">{suffix}</span>}
    </div>
  );
});

/** Campo de contraseña con botón mostrar/ocultar. */
export const PasswordInput = forwardRef(function PasswordInput({ invalid, className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-wrap input-wrap--action">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('control', invalid && 'control--invalid', className)}
        {...props}
      />
      <span className="input-wrap__action">
        <Button
          variant="ghost"
          size="sm"
          icon={visible ? EyeOff : Eye}
          tooltip={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tooltipPosition="top"
          onClick={() => setVisible((v) => !v)}
        />
      </span>
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ invalid, className, ...props }, ref) {
  return <textarea ref={ref} className={cn('control', invalid && 'control--invalid', className)} {...props} />;
});

/**
 * Select simple. options: [{ value, label }]
 */
export const Select = forwardRef(function Select({ options = [], invalid, size, className, placeholder, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn('control', size === 'sm' && 'control--sm', invalid && 'control--invalid', className)}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
