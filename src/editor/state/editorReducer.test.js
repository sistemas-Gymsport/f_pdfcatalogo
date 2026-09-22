import { describe, expect, it } from 'vitest';
import { A, editorReducer, initialEditorState, selectIsDirty, HISTORY_LIMIT } from './editorReducer.js';
import { createElement, toSavePayload } from './documentModel.js';
import { snapRect, pageGuides } from '../utils/geometry.js';

const catalog = {
  id: 'c1',
  name: 'Test',
  version: 3,
  pageWidth: 210,
  pageHeight: 297,
  marginTop: 15,
  marginBottom: 15,
  marginLeft: 15,
  marginRight: 15,
  colorPrimary: '#F64851',
  colorSecondary: '#1F2937',
  colorText: '#111827',
  colorBackground: '#FFFFFF',
};

const el = (id, extra = {}) => ({ id, type: 'rectangle', x: 10, y: 10, width: 20, height: 20, zIndex: 0, ...extra });

function loaded(elements = []) {
  return editorReducer(initialEditorState, {
    type: A.LOAD,
    catalog: { ...catalog, pages: [{ id: 'p1', name: null, backgroundColor: null, elements }] },
  });
}

const run = (state, ...actions) => actions.reduce(editorReducer, state);

describe('editorReducer', () => {
  it('LOAD deja el documento limpio y selecciona la primera página', () => {
    const state = loaded([el('a')]);
    expect(state.currentPageId).toBe('p1');
    expect(state.pages[0].elements).toHaveLength(1);
    expect(selectIsDirty(state)).toBe(false);
  });

  it('agregar, mover y eliminar marca cambios sin guardar', () => {
    let state = run(loaded(), { type: A.ADD_ELEMENTS, elements: [el('a')], at: 1 });
    expect(state.selectedIds).toEqual(['a']);
    expect(selectIsDirty(state)).toBe(true);

    state = run(state, { type: A.UPDATE_ELEMENTS, ids: ['a'], changes: { x: 50.123456, width: 0.2 }, at: 2 });
    expect(state.pages[0].elements[0].x).toBe(50.12);
    expect(state.pages[0].elements[0].width).toBe(1); // tamaño mínimo 1 mm

    state = run(state, { type: A.DELETE_ELEMENTS, ids: ['a'], at: 3 });
    expect(state.pages[0].elements).toHaveLength(0);
    expect(state.selectedIds).toEqual([]);
  });

  it('deshacer / rehacer', () => {
    let state = run(
      loaded([el('a')]),
      { type: A.UPDATE_ELEMENTS, ids: ['a'], changes: { x: 100 }, at: 1 },
      { type: A.UPDATE_ELEMENTS, ids: ['a'], changes: { y: 200 }, at: 5000 },
    );
    state = run(state, { type: A.UNDO });
    expect(state.pages[0].elements[0]).toMatchObject({ x: 100, y: 10 });
    state = run(state, { type: A.UNDO });
    expect(state.pages[0].elements[0]).toMatchObject({ x: 10, y: 10 });
    state = run(state, { type: A.REDO }, { type: A.REDO });
    expect(state.pages[0].elements[0]).toMatchObject({ x: 100, y: 200 });
  });

  it('agrupa cambios continuos con la misma clave en un solo paso de historial', () => {
    let state = loaded([el('a')]);
    for (let i = 0; i < 10; i++) {
      state = editorReducer(state, { type: A.UPDATE_ELEMENTS, ids: ['a'], changes: { opacity: i / 10 }, coalesceKey: 'op', at: i * 100 });
    }
    expect(state.past).toHaveLength(1);
    state = editorReducer(state, { type: A.UNDO });
    expect(state.pages[0].elements[0].opacity).toBeUndefined();
  });

  it('limita el historial', () => {
    let state = loaded([el('a')]);
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
      state = editorReducer(state, { type: A.UPDATE_ELEMENTS, ids: ['a'], changes: { x: i }, at: i * 5000 });
    }
    expect(state.past).toHaveLength(HISTORY_LIMIT);
  });

  it('ordena capas (frente, fondo, adelante, atrás)', () => {
    const base = loaded([el('a', { zIndex: 0 }), el('b', { zIndex: 1 }), el('c', { zIndex: 2 })]);
    const z = (s) => Object.fromEntries(s.pages[0].elements.map((e) => [e.id, e.zIndex]));
    expect(z(run(base, { type: A.REORDER_Z, id: 'a', direction: 'front' }))).toEqual({ b: 0, c: 1, a: 2 });
    expect(z(run(base, { type: A.REORDER_Z, id: 'c', direction: 'back' }))).toEqual({ c: 0, a: 1, b: 2 });
    expect(z(run(base, { type: A.REORDER_Z, id: 'a', direction: 'forward' }))).toEqual({ b: 0, a: 1, c: 2 });
    expect(z(run(base, { type: A.REORDER_Z, id: 'c', direction: 'backward' }))).toEqual({ a: 0, c: 1, b: 2 });
  });

  it('páginas: agregar, mover, eliminar (nunca la última)', () => {
    let state = run(loaded(), { type: A.ADD_PAGE, page: { id: 'p2', elements: [] }, index: 1, at: 1 });
    expect(state.currentPageId).toBe('p2');
    state = run(state, { type: A.MOVE_PAGE, from: 1, to: 0, at: 2 });
    expect(state.pages.map((p) => p.id)).toEqual(['p2', 'p1']);
    state = run(state, { type: A.DELETE_PAGE, pageId: 'p2', at: 3 });
    expect(state.pages.map((p) => p.id)).toEqual(['p1']);
    expect(state.currentPageId).toBe('p1');
    expect(run(state, { type: A.DELETE_PAGE, pageId: 'p1' }).pages).toHaveLength(1);
  });

  it('SET_CATALOG actualiza configuración sin tocar páginas ni versión', () => {
    const state = run(loaded([el('a')]), { type: A.SET_CATALOG, catalog: { ...catalog, colorPrimary: '#000000', version: 99, pages: [] } });
    expect(state.catalog.colorPrimary).toBe('#000000');
    expect(state.catalog.version).toBe(3);
    expect(state.pages[0].elements).toHaveLength(1);
  });

  it('SAVE_SUCCESS actualiza versión y limpia el estado "sin guardar"', () => {
    let state = run(loaded(), { type: A.ADD_ELEMENTS, elements: [el('a')], at: 1 });
    state = run(state, { type: A.SAVE_SUCCESS, version: 4, changeId: state.changeId });
    expect(selectIsDirty(state)).toBe(false);
    expect(state.catalog.version).toBe(4);
  });
});

describe('documentModel', () => {
  it('crea elementos dentro de los márgenes y por encima del resto', () => {
    const page = { elements: [el('a', { zIndex: 7 })] };
    const title = createElement('title', catalog, page);
    expect(title.x).toBeGreaterThanOrEqual(15);
    expect(title.x + title.width).toBeLessThanOrEqual(195);
    expect(title.zIndex).toBe(8);
    expect(title.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('el payload de guardado solo lleva campos persistibles', () => {
    const state = loaded([el('a', { image: { url: 'x' }, x: 1.23456, extra: 'no' })]);
    const payload = toSavePayload(state);
    expect(payload.version).toBe(3);
    const [element] = payload.pages[0].elements;
    expect(element.image).toBeUndefined();
    expect(element.extra).toBeUndefined();
    expect(element.x).toBe(1.23);
    expect(element.locked).toBe(false);
    expect(element.content).toBeNull();
  });
});

describe('geometry', () => {
  it('ajusta al margen y al centro de la página', () => {
    const guides = pageGuides(catalog);
    expect(snapRect({ x: 16, y: 100, width: 20, height: 10 }, guides, 2)).toMatchObject({ x: 15, lines: { x: 15 } });
    expect(snapRect({ x: 94, y: 100, width: 20, height: 10 }, guides, 2).x).toBe(95); // centro = 105
    expect(snapRect({ x: 50, y: 100, width: 20, height: 10 }, guides, 2).lines.x).toBeNull();
  });
});
