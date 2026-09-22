import { useEffect, useState } from 'react';
import { Ban } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { COLOR_TOKEN_LABELS, isHexColor, normalizeHex, resolveToHex } from '../../utils/colors.js';
import './ColorPicker.css';

/**
 * Selector de color: selector nativo + campo HEX.
 * Si recibe `catalog`, muestra además los colores del catálogo como tokens
 * (primary, secondary…): el elemento queda enlazado a la variable CSS y
 * cambia automáticamente si se modifican los colores del catálogo.
 */
export function ColorPicker({ value, onChange, catalog, allowNone = false, noneLabel = 'Sin color', id, invalid, ...props }) {
  const isToken = Boolean(catalog && COLOR_TOKEN_LABELS[value]);
  const hex = catalog ? resolveToHex(value, catalog) : isHexColor(value) ? value : null;
  const displayValue = isToken ? COLOR_TOKEN_LABELS[value] : value === 'transparent' || !value ? '' : value;
  const [draft, setDraft] = useState(displayValue);

  useEffect(() => setDraft(displayValue), [displayValue]);

  const commit = () => {
    if (draft === displayValue) return;
    const normalized = normalizeHex(draft);
    if (normalized) onChange(normalized);
    else setDraft(displayValue);
  };

  return (
    <div className="color-picker">
      <div className="color-picker__main">
        <label
          className={cn('color-picker__swatch', !hex && 'is-empty')}
          style={hex ? { background: hex } : undefined}
          data-tooltip="Elegir color"
          data-tooltip-pos="top"
        >
          <input
            type="color"
            value={hex && hex.length === 7 ? hex : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            aria-label="Selector de color"
          />
        </label>
        <input
          id={id}
          className={cn('control control--sm color-picker__hex', isToken && 'is-token', invalid && 'control--invalid')}
          value={draft}
          placeholder={allowNone ? noneLabel : '#RRGGBB'}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => isToken && setDraft(hex || '')}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          aria-label="Color en formato HEX"
          {...props}
        />
      </div>

      {(catalog || allowNone) && (
        <div className="color-picker__tokens">
          {catalog &&
            Object.entries(COLOR_TOKEN_LABELS).map(([token, label]) => (
              <button
                key={token}
                type="button"
                className={cn('color-picker__token', value === token && 'is-selected')}
                style={{ background: resolveToHex(token, catalog) }}
                onClick={() => onChange(token)}
                data-tooltip={`Color ${label.toLowerCase()} del catálogo`}
                data-tooltip-pos="top"
                aria-label={`Usar color ${label.toLowerCase()} del catálogo`}
              />
            ))}
          {allowNone && (
            <button
              type="button"
              className={cn('color-picker__token color-picker__token--none', (!value || value === 'transparent') && 'is-selected')}
              onClick={() => onChange(null)}
              data-tooltip={noneLabel}
              data-tooltip-pos="top"
              aria-label={noneLabel}
            >
              <Ban size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
