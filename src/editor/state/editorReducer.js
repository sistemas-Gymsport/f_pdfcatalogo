/**
 * Estado del editor (documento en edición). Reducer puro: los ids y marcas de
 * tiempo llegan en las acciones, así se puede testear y reproducir.
 *
 * - pages: fuente de verdad del documento mientras se edita.
 * - past/future: historial (snapshots inmutables de pages) para deshacer/rehacer.
 * - changeId/savedChangeId: detectan cambios sin guardar (base del autosave).
 */
import { round2, MIN_SIZE_MM } from '../utils/geometry.js';

export const HISTORY_LIMIT = 100;
const COALESCE_MS = 1000;

export const A = {
  LOAD: 'LOAD',
  SET_CATALOG: 'SET_CATALOG',
  SELECT_PAGE: 'SELECT_PAGE',
  SELECT: 'SELECT',
  ADD_ELEMENTS: 'ADD_ELEMENTS',
  UPDATE_ELEMENTS: 'UPDATE_ELEMENTS',
  DELETE_ELEMENTS: 'DELETE_ELEMENTS',
  REORDER_Z: 'REORDER_Z',
  COPY: 'COPY',
  ADD_PAGE: 'ADD_PAGE',
  DELETE_PAGE: 'DELETE_PAGE',
  MOVE_PAGE: 'MOVE_PAGE',
  UPDATE_PAGE: 'UPDATE_PAGE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  SAVE_SUCCESS: 'SAVE_SUCCESS',
};

export const initialEditorState = {
  catalog: null,
  pages: [],
  currentPageId: null,
  selectedIds: [],
  clipboard: [],
  past: [],
  future: [],
  lastChange: null,
  changeId: 0,
  savedChangeId: 0,
};

/** Registra un cambio de documento en el historial (agrupa cambios continuos con la misma clave). */
function commit(state, pages, action, extra = {}) {
  const { coalesceKey, at = 0 } = action;
  const coalesce =
    coalesceKey && state.lastChange?.key === coalesceKey && at - state.lastChange.at < COALESCE_MS && state.past.length > 0;
  const past = coalesce
    ? state.past
    : [...state.past, { pages: state.pages, currentPageId: state.currentPageId }].slice(-HISTORY_LIMIT);

  return {
    ...state,
    ...extra,
    pages,
    past,
    future: [],
    lastChange: coalesceKey ? { key: coalesceKey, at } : null,
    changeId: state.changeId + 1,
  };
}

const mapCurrentPage = (state, fn) => state.pages.map((page) => (page.id === state.currentPageId ? fn(page) : page));

function sanitizeChanges(changes) {
  const clean = { ...changes };
  for (const key of ['x', 'y', 'width', 'height', 'rotation']) {
    if (clean[key] !== undefined) clean[key] = round2(clean[key]);
  }
  if (clean.width !== undefined) clean.width = Math.max(MIN_SIZE_MM, clean.width);
  if (clean.height !== undefined) clean.height = Math.max(MIN_SIZE_MM, clean.height);
  return clean;
}

function applyUpdates(pages, ids, changes) {
  const idSet = new Set(ids);
  return pages.map((page) =>
    page.elements.some((el) => idSet.has(el.id))
      ? {
          ...page,
          elements: page.elements.map((el) => {
            if (!idSet.has(el.id)) return el;
            const next = typeof changes === 'function' ? changes(el) : changes;
            return { ...el, ...sanitizeChanges(next) };
          }),
        }
      : page,
  );
}

/** Reasigna zIndex 0..n según el orden tras mover un elemento de capa. */
function reorderZ(elements, id, direction) {
  const sorted = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const index = sorted.findIndex((el) => el.id === id);
  if (index === -1) return elements;
  const [item] = sorted.splice(index, 1);
  const target = {
    front: sorted.length,
    back: 0,
    forward: Math.min(index + 1, sorted.length),
    backward: Math.max(index - 1, 0),
  }[direction];
  sorted.splice(target, 0, item);
  const zById = new Map(sorted.map((el, z) => [el.id, z]));
  return elements.map((el) => ({ ...el, zIndex: zById.get(el.id) }));
}

function restore(state, snapshot, stackKey) {
  const current = { pages: state.pages, currentPageId: state.currentPageId };
  const pageExists = snapshot.pages.some((p) => p.id === state.currentPageId);
  const currentPageId = pageExists ? state.currentPageId : snapshot.currentPageId ?? snapshot.pages[0]?.id;
  const elementIds = new Set(snapshot.pages.flatMap((p) => p.elements.map((e) => e.id)));
  return {
    ...state,
    pages: snapshot.pages,
    currentPageId,
    selectedIds: state.selectedIds.filter((id) => elementIds.has(id)),
    past: stackKey === 'past' ? state.past.slice(0, -1) : [...state.past, current],
    future: stackKey === 'future' ? state.future.slice(0, -1) : [...state.future, current],
    lastChange: null,
    changeId: state.changeId + 1,
  };
}

export function editorReducer(state, action) {
  switch (action.type) {
    case A.LOAD: {
      const { pages = [], ...catalog } = action.catalog;
      return {
        ...initialEditorState,
        catalog,
        pages: pages.map((page) => ({
          id: page.id,
          name: page.name,
          backgroundColor: page.backgroundColor,
          elements: page.elements || [],
        })),
        currentPageId: pages[0]?.id ?? null,
      };
    }

    case A.SET_CATALOG: {
      // Configuración del documento (formato, márgenes, colores). No afecta al historial.
      const { pages: _ignored, version: _v, ...settings } = action.catalog;
      return { ...state, catalog: { ...state.catalog, ...settings } };
    }

    case A.SELECT_PAGE:
      if (!state.pages.some((p) => p.id === action.pageId)) return state;
      return { ...state, currentPageId: action.pageId, selectedIds: [] };

    case A.SELECT: {
      if (!action.additive) return { ...state, selectedIds: action.ids };
      const set = new Set(state.selectedIds);
      for (const id of action.ids) {
        if (set.has(id)) set.delete(id);
        else set.add(id);
      }
      return { ...state, selectedIds: [...set] };
    }

    case A.ADD_ELEMENTS: {
      const pages = mapCurrentPage(state, (page) => ({ ...page, elements: [...page.elements, ...action.elements] }));
      return commit(state, pages, action, { selectedIds: action.elements.map((e) => e.id) });
    }

    case A.UPDATE_ELEMENTS:
      if (!action.ids.length) return state;
      return commit(state, applyUpdates(state.pages, action.ids, action.changes), action);

    case A.DELETE_ELEMENTS: {
      const ids = new Set(action.ids);
      if (!ids.size) return state;
      const pages = state.pages.map((page) => ({ ...page, elements: page.elements.filter((el) => !ids.has(el.id)) }));
      return commit(state, pages, action, { selectedIds: state.selectedIds.filter((id) => !ids.has(id)) });
    }

    case A.REORDER_Z: {
      const pages = state.pages.map((page) =>
        page.elements.some((el) => el.id === action.id) ? { ...page, elements: reorderZ(page.elements, action.id, action.direction) } : page,
      );
      return commit(state, pages, action);
    }

    case A.COPY:
      return { ...state, clipboard: action.elements };

    case A.ADD_PAGE: {
      const index = action.index ?? state.pages.length;
      const pages = [...state.pages.slice(0, index), action.page, ...state.pages.slice(index)];
      return commit(state, pages, action, { currentPageId: action.page.id, selectedIds: [] });
    }

    case A.DELETE_PAGE: {
      if (state.pages.length <= 1) return state;
      const index = state.pages.findIndex((p) => p.id === action.pageId);
      if (index === -1) return state;
      const pages = state.pages.filter((p) => p.id !== action.pageId);
      const currentPageId =
        state.currentPageId === action.pageId ? pages[Math.min(index, pages.length - 1)].id : state.currentPageId;
      return commit(state, pages, action, { currentPageId, selectedIds: [] });
    }

    case A.MOVE_PAGE: {
      const { from, to } = action;
      if (from === to || to < 0 || to >= state.pages.length) return state;
      const pages = [...state.pages];
      const [moved] = pages.splice(from, 1);
      pages.splice(to, 0, moved);
      return commit(state, pages, action);
    }

    case A.UPDATE_PAGE: {
      const pages = state.pages.map((page) => (page.id === action.pageId ? { ...page, ...action.changes } : page));
      return commit(state, pages, action);
    }

    case A.UNDO:
      return state.past.length ? restore(state, state.past[state.past.length - 1], 'past') : state;

    case A.REDO:
      return state.future.length ? restore(state, state.future[state.future.length - 1], 'future') : state;

    case A.SAVE_SUCCESS:
      return { ...state, catalog: { ...state.catalog, version: action.version }, savedChangeId: action.changeId };

    default:
      return state;
  }
}

/* ------------------------------ Selectores ------------------------------ */

export const selectCurrentPage = (state) => state.pages.find((p) => p.id === state.currentPageId) || null;

export const selectSelectedElements = (state) => {
  const ids = new Set(state.selectedIds);
  return (selectCurrentPage(state)?.elements || []).filter((el) => ids.has(el.id));
};

export const selectIsDirty = (state) => state.changeId !== state.savedChangeId;
