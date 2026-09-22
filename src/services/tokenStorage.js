/**
 * Guarda únicamente el JWT firmado por el backend (nunca datos de usuario ni
 * contraseñas). La validez de la sesión siempre la decide el backend.
 */
const KEY = 'pdfcatalogo.token';

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      /* almacenamiento no disponible */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  },
};
