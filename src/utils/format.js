const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });
const relativeFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '');

/** "hace 5 minutos", "ayer"… */
export function formatRelative(value) {
  if (!value) return '';
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit);
  }
  return 'hace un momento';
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 12.3456 → "12.35" (sin ceros innecesarios) */
export const formatNumber = (value, decimals = 2) =>
  Number.isFinite(Number(value)) ? String(Math.round(Number(value) * 10 ** decimals) / 10 ** decimals) : '';

export const pluralize = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
