/** Une clases CSS ignorando valores falsos: cn('a', cond && 'b') */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
