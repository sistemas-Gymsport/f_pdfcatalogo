import { tokenStorage } from './tokenStorage.js';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

if (!API_URL) {
  console.error('VITE_API_URL no está definido. Revisa el archivo .env del frontend.');
}

export const API_BASE = `${API_URL}/api`;

/** Error normalizado con mensaje apto para mostrar al usuario. */
export class ApiError extends Error {
  constructor(message, { status = 0, errorCode = 'UNKNOWN', details } = {}) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

let unauthorizedHandler = null;

/** El AuthContext registra aquí qué hacer cuando la sesión expira (401). */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

async function parseError(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    /* respuesta sin JSON */
  }
  const fallback =
    response.status >= 500
      ? 'El servidor tuvo un problema. Intenta nuevamente en unos segundos.'
      : 'No se pudo completar la solicitud.';
  return new ApiError(body?.message || fallback, {
    status: response.status,
    errorCode: body?.errorCode || `HTTP_${response.status}`,
    details: body?.details,
  });
}

/**
 * Cliente HTTP único de la aplicación.
 * @param {string} path Ruta relativa a /api (ej. "/catalogs")
 * @param {{ method?: string, body?: any, responseType?: 'json'|'blob'|'text', auth?: boolean, signal?: AbortSignal }} options
 */
export async function request(path, { method = 'GET', body, responseType = 'json', auth = true, signal } = {}) {
  const headers = {};
  const token = tokenStorage.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', { errorCode: 'NETWORK_ERROR' });
  }

  if (!response.ok) {
    const error = await parseError(response);
    if (response.status === 401 && auth && unauthorizedHandler) unauthorizedHandler(error);
    throw error;
  }

  if (responseType === 'blob') {
    return { blob: await response.blob(), headers: response.headers };
  }
  if (responseType === 'text') return response.text();

  const json = await response.json();
  return json.data ?? json;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

/**
 * Subida con progreso (fetch no informa el progreso de subida).
 * @param {(percent:number) => void} onProgress
 */
export function uploadWithProgress(path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${path}`);
    const token = tokenStorage.get();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () =>
      reject(new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', { errorCode: 'NETWORK_ERROR' }));
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* sin JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body?.data ?? body);
        return;
      }
      const error = new ApiError(body?.message || 'No se pudo subir la imagen.', {
        status: xhr.status,
        errorCode: body?.errorCode || `HTTP_${xhr.status}`,
      });
      if (xhr.status === 401 && unauthorizedHandler) unauthorizedHandler(error);
      reject(error);
    };
    xhr.send(formData);
  });
}
