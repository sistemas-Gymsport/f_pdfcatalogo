import { request } from './apiClient.js';
import { filenameFromDisposition } from '../utils/files.js';

export const pdfService = {
  /** Genera el PDF en el backend a partir de los datos guardados. */
  async generate(catalogId) {
    const { blob, headers } = await request(`/pdf/catalogs/${catalogId}`, { responseType: 'blob' });
    return { blob, filename: filenameFromDisposition(headers.get('Content-Disposition'), 'catalogo.pdf') };
  },
  /** HTML exacto que se convierte en PDF (para la vista previa). */
  previewHtml: (catalogId, { guides = false } = {}) =>
    request(`/pdf/catalogs/${catalogId}/html${guides ? '?guides=1' : ''}`, { responseType: 'text' }),
};
