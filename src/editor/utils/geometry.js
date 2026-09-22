import { PX_PER_MM } from '../../shared/renderModel.js';

export const mmToPx = (mm) => mm * PX_PER_MM;
export const pxToMm = (px) => px / PX_PER_MM;
export const round2 = (value) => Math.round(Number(value) * 100) / 100;

export const MIN_SIZE_MM = 1;

/** Líneas de referencia verticales (x) y horizontales (y) de la página, en mm. */
export function pageGuides(catalog) {
  const w = catalog.pageWidth;
  const h = catalog.pageHeight;
  return {
    x: [0, catalog.marginLeft, w / 2, w - catalog.marginRight, w],
    y: [0, catalog.marginTop, h / 2, h - catalog.marginBottom, h],
  };
}

/**
 * Ajusta un rectángulo (mm) a las guías más cercanas si está dentro del umbral.
 * Compara bordes y centro. Devuelve la posición ajustada y las guías activas.
 */
export function snapRect(rect, guides, threshold) {
  const result = { x: rect.x, y: rect.y, lines: { x: null, y: null } };

  const axis = (start, size, candidates) => {
    let best = null;
    for (const guide of candidates) {
      for (const offset of [0, size / 2, size]) {
        const diff = guide - (start + offset);
        if (Math.abs(diff) <= threshold && (!best || Math.abs(diff) < Math.abs(best.diff))) best = { diff, guide };
      }
    }
    return best;
  };

  const snapX = axis(rect.x, rect.width, guides.x);
  if (snapX) {
    result.x = round2(rect.x + snapX.diff);
    result.lines.x = snapX.guide;
  }
  const snapY = axis(rect.y, rect.height, guides.y);
  if (snapY) {
    result.y = round2(rect.y + snapY.diff);
    result.lines.y = snapY.guide;
  }
  return result;
}

/** Área útil (dentro de márgenes) en mm. */
export function contentArea(catalog) {
  return {
    x: catalog.marginLeft,
    y: catalog.marginTop,
    width: catalog.pageWidth - catalog.marginLeft - catalog.marginRight,
    height: catalog.pageHeight - catalog.marginTop - catalog.marginBottom,
  };
}
