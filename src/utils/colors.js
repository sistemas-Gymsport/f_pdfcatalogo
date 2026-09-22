const HEX_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isHexColor = (value) => HEX_REGEX.test(String(value || '').trim());

/** "#abc" | "abc" → "#AABBCC"; devuelve null si no es válido. */
export function normalizeHex(value) {
  let hex = String(value || '').trim();
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (!isHexColor(hex)) return null;
  hex = hex.slice(1);
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return `#${hex.toUpperCase()}`;
}

/** Nombres legibles de los tokens de color del catálogo. */
export const COLOR_TOKEN_LABELS = {
  primary: 'Principal',
  secondary: 'Secundario',
  text: 'Texto',
  background: 'Fondo',
};

export const CATALOG_COLOR_FIELDS = {
  primary: 'colorPrimary',
  secondary: 'colorSecondary',
  text: 'colorText',
  background: 'colorBackground',
};

/** Valor HEX real de un color (resuelve tokens con los colores del catálogo). */
export function resolveToHex(value, catalog) {
  if (!value || value === 'transparent') return null;
  const field = CATALOG_COLOR_FIELDS[value];
  return field ? catalog?.[field] ?? null : value;
}
