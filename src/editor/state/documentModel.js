import { getElementMeta } from '../elementRegistry.js';
import { contentArea, round2 } from '../utils/geometry.js';

/** Campos de un elemento que se persisten en la base de datos. */
export const ELEMENT_FIELDS = [
  'id', 'type', 'x', 'y', 'width', 'height', 'rotation', 'zIndex', 'locked', 'hidden',
  'content', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'textAlign', 'verticalAlign', 'color', 'backgroundColor', 'borderWidth', 'borderColor',
  'borderStyle', 'borderRadius', 'padding', 'opacity', 'imageId', 'objectFit', 'props',
];

export const uid = () => crypto.randomUUID();

export const maxZ = (elements) => elements.reduce((max, el) => Math.max(max, el.zIndex ?? 0), -1);

/**
 * Crea un elemento nuevo con los valores por defecto de su tipo, dentro del
 * área de márgenes y escalonado para no quedar exactamente encima del anterior.
 */
export function createElement(type, catalog, page, overrides = {}) {
  const meta = getElementMeta(type);
  const area = contentArea(catalog);
  const defaults = { ...meta.defaults, ...overrides };
  const width = Math.min(defaults.width, area.width);
  const height = Math.min(defaults.height, area.height);
  const stagger = (page.elements.length % 6) * 6;

  return {
    rotation: 0,
    locked: false,
    hidden: false,
    ...defaults,
    id: uid(),
    type,
    width: round2(width),
    height: round2(height),
    x: round2(Math.min(area.x + stagger, area.x + area.width - width)),
    y: round2(Math.min(area.y + stagger, area.y + area.height - height)),
    zIndex: maxZ(page.elements) + 1,
  };
}

/** Copia de elementos con ids nuevos, desplazados y por encima del resto. */
export function cloneElements(elements, targetElements, offset = 5) {
  let z = maxZ(targetElements);
  return elements.map((el) => ({
    ...structuredClone(el),
    id: uid(),
    x: round2(el.x + offset),
    y: round2(el.y + offset),
    zIndex: ++z,
  }));
}

export const createPage = () => ({ id: uid(), name: null, backgroundColor: null, elements: [] });

export function clonePage(page) {
  return {
    ...page,
    id: uid(),
    elements: page.elements.map((el) => ({ ...structuredClone(el), id: uid() })),
  };
}

function toElementPayload(el) {
  const payload = {};
  for (const field of ELEMENT_FIELDS) payload[field] = el[field] ?? null;
  for (const field of ['x', 'y', 'width', 'height', 'rotation']) payload[field] = round2(el[field] ?? 0);
  payload.zIndex = Math.round(el.zIndex ?? 0);
  payload.locked = Boolean(el.locked);
  payload.hidden = Boolean(el.hidden);
  return payload;
}

/** Documento que se envía a PUT /api/catalogs/:id/document. */
export function toSavePayload(state) {
  return {
    version: state.catalog.version,
    pages: state.pages.map((page) => ({
      id: page.id,
      name: page.name || null,
      backgroundColor: page.backgroundColor || null,
      elements: page.elements.map(toElementPayload),
    })),
  };
}
