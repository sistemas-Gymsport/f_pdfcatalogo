import { api, uploadWithProgress } from './apiClient.js';

export const imageService = {
  list: (search = '') => api.get(`/images${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => api.get(`/images/${id}`),
  /** @param {{ file: File, name?: string, description?: string }} data */
  upload: ({ file, name, description }, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    if (description) form.append('description', description);
    return uploadWithProgress('/images', form, onProgress);
  },
  update: (id, data) => api.patch(`/images/${id}`, data),
  remove: (id) => api.delete(`/images/${id}`),
};
