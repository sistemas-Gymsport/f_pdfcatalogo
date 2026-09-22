/** Convierte details[] del backend en { campo: mensaje } para los formularios. */
export const fieldErrors = (error) => Object.fromEntries((error?.details || []).map((d) => [d.field, d.message]));
