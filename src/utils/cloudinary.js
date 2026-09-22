/**
 * Genera variantes optimizadas de una URL de Cloudinary insertando
 * transformaciones después de "/upload/". El PDF usa siempre la original.
 */
export function cloudinaryVariant(url, transformation) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${transformation}/`);
}

export const thumbnailUrl = (url) => cloudinaryVariant(url, 'c_limit,w_480,q_auto,f_auto');

/** Resolución suficiente para el editor sin cargar el original. */
export const editorImageUrl = (url) => cloudinaryVariant(url, 'c_limit,w_1800,q_auto,f_auto');
