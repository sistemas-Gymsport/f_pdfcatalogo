import { useEffect, useState } from 'react';
import { Input } from './Input.jsx';
import { formatNumber } from '../../utils/format.js';

/**
 * Input numérico que confirma el valor al salir del campo o con Enter
 * (evita guardar valores intermedios mientras se escribe).
 * Las flechas ↑/↓ suman/restan "step" (Shift = ×10).
 */
export function NumberInput({ value, onChange, min, max, step = 1, decimals = 2, suffix, size = 'sm', ...props }) {
  const [draft, setDraft] = useState(formatNumber(value, decimals));

  useEffect(() => {
    setDraft(formatNumber(value, decimals));
  }, [value, decimals]);

  const clamp = (n) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

  const commit = (raw = draft) => {
    const parsed = Number(String(raw).replace(',', '.'));
    if (raw === '' || !Number.isFinite(parsed)) {
      setDraft(formatNumber(value, decimals));
      return;
    }
    const next = clamp(Math.round(parsed * 10 ** decimals) / 10 ** decimals);
    setDraft(formatNumber(next, decimals));
    if (next !== value) onChange(next);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      commit();
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      setDraft(formatNumber(value, decimals));
      event.currentTarget.blur();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const delta = (event.key === 'ArrowUp' ? 1 : -1) * step * (event.shiftKey ? 10 : 1);
      commit(String((Number(value) || 0) + delta));
    }
  };

  return (
    <Input
      inputMode="decimal"
      value={draft}
      suffix={suffix}
      size={size}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => commit()}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
}
