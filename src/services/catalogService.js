import { api } from './apiClient.js';

const query = (search) => (search ? `?search=${encodeURIComponent(search)}` : '');

export const catalogService = {
  list: (search = '') => api.get(`/catalogs${query(search)}`),
  get: (id) => api.get(`/catalogs/${id}`),
  create: (data) => api.post('/catalogs', data),
  update: (id, data) => api.put(`/catalogs/${id}`, data),
  remove: (id) => api.delete(`/catalogs/${id}`),
  duplicate: (id) => api.post(`/catalogs/${id}/duplicate`),
  /** Guarda el documento completo del editor (páginas + elementos). */
  saveDocument: (id, document) => api.put(`/catalogs/${id}/document`, document),
  stats: () => api.get('/stats'),
};

export const configService = {
  get: () => api.get('/config'),
  health: () => api.get('/health', { auth: false }),
};
