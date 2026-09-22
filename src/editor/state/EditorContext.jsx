import { createContext, useContext, useMemo, useReducer, useRef, useState } from 'react';
import { A, editorReducer, initialEditorState, selectCurrentPage, selectSelectedElements } from './editorReducer.js';
import { cloneElements, clonePage, createElement, createPage } from './documentModel.js';
import { contentArea, round2 } from '../utils/geometry.js';

const EditorStateContext = createContext(null);
const EditorActionsContext = createContext(null);
const EditorUiContext = createContext(null);

const ZOOM_LIMITS = { min: 0.25, max: 3 };

/**
 * Provee tres contextos independientes:
 *  - estado del documento (páginas, elementos, selección, historial)
 *  - acciones (referencias estables; no provocan renders)
 *  - estado de interfaz (zoom, guías, imán, edición de texto en línea)
 */
export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [zoom, setZoomState] = useState(1);
  const [showGuides, setShowGuides] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [fitRequest, setFitRequest] = useState(0);

  const actions = useMemo(() => {
    const get = () => stateRef.current;
    const now = () => Date.now();
    const current = () => selectCurrentPage(get());

    return {
      dispatch,
      load: (catalog) => dispatch({ type: A.LOAD, catalog }),
      setCatalog: (catalog) => dispatch({ type: A.SET_CATALOG, catalog }),

      /* Selección */
      selectElement: (id, additive = false) => dispatch({ type: A.SELECT, ids: [id], additive }),
      clearSelection: () => dispatch({ type: A.SELECT, ids: [] }),

      /* Elementos */
      addElement(type, overrides) {
        const page = current();
        if (!page) return null;
        const element = createElement(type, get().catalog, page, overrides);
        dispatch({ type: A.ADD_ELEMENTS, elements: [element], at: now() });
        return element;
      },
      /** Crea un elemento imagen respetando la proporción de la foto. */
      addImageElement(image) {
        const page = current();
        if (!page) return null;
        const area = contentArea(get().catalog);
        const width = Math.min(100, area.width);
        const ratio = image.height && image.width ? image.height / image.width : 0.66;
        const height = Math.min(round2(width * ratio), area.height);
        const element = createElement('image', get().catalog, page, {
          width,
          height,
          imageId: image.id,
          image: { id: image.id, url: image.url, width: image.width, height: image.height, name: image.name },
        });
        dispatch({ type: A.ADD_ELEMENTS, elements: [element], at: now() });
        return element;
      },
      updateElements: (ids, changes, coalesceKey) => dispatch({ type: A.UPDATE_ELEMENTS, ids, changes, coalesceKey, at: now() }),
      updateElement: (id, changes, coalesceKey) => dispatch({ type: A.UPDATE_ELEMENTS, ids: [id], changes, coalesceKey, at: now() }),
      setElementImage(id, image) {
        dispatch({
          type: A.UPDATE_ELEMENTS,
          ids: [id],
          changes: { imageId: image?.id ?? null, image: image ? { id: image.id, url: image.url, width: image.width, height: image.height, name: image.name } : null },
          at: now(),
        });
      },
      deleteSelected() {
        const ids = selectSelectedElements(get()).filter((el) => !el.locked).map((el) => el.id);
        if (ids.length) dispatch({ type: A.DELETE_ELEMENTS, ids, at: now() });
      },
      deleteElement: (id) => dispatch({ type: A.DELETE_ELEMENTS, ids: [id], at: now() }),
      duplicateSelected() {
        const selected = selectSelectedElements(get());
        if (!selected.length) return;
        const copies = cloneElements(selected, current().elements).map((el) => ({ ...el, locked: false }));
        dispatch({ type: A.ADD_ELEMENTS, elements: copies, at: now() });
      },
      copySelected() {
        const selected = selectSelectedElements(get());
        if (selected.length) dispatch({ type: A.COPY, elements: structuredClone(selected) });
        return selected.length;
      },
      paste() {
        const { clipboard } = get();
        if (!clipboard.length || !current()) return 0;
        dispatch({ type: A.ADD_ELEMENTS, elements: cloneElements(clipboard, current().elements), at: now() });
        return clipboard.length;
      },
      reorder: (id, direction) => dispatch({ type: A.REORDER_Z, id, direction, at: now() }),
      /** Mueve la selección con el teclado (mm). */
      nudge(dx, dy) {
        const ids = selectSelectedElements(get()).filter((el) => !el.locked).map((el) => el.id);
        if (!ids.length) return;
        dispatch({
          type: A.UPDATE_ELEMENTS,
          ids,
          changes: (el) => ({ x: el.x + dx, y: el.y + dy }),
          coalesceKey: `nudge:${ids.join(',')}`,
          at: now(),
        });
      },

      /* Páginas */
      selectPage: (pageId) => dispatch({ type: A.SELECT_PAGE, pageId }),
      addPage() {
        const { pages, currentPageId } = get();
        const index = pages.findIndex((p) => p.id === currentPageId) + 1;
        dispatch({ type: A.ADD_PAGE, page: createPage(), index: index || pages.length, at: now() });
      },
      duplicatePage(pageId) {
        const { pages } = get();
        const index = pages.findIndex((p) => p.id === pageId);
        if (index === -1) return;
        dispatch({ type: A.ADD_PAGE, page: clonePage(pages[index]), index: index + 1, at: now() });
      },
      deletePage: (pageId) => dispatch({ type: A.DELETE_PAGE, pageId, at: now() }),
      movePage: (from, to) => dispatch({ type: A.MOVE_PAGE, from, to, at: now() }),
      updatePage: (pageId, changes, coalesceKey) => dispatch({ type: A.UPDATE_PAGE, pageId, changes, coalesceKey, at: now() }),

      /* Historial */
      undo: () => dispatch({ type: A.UNDO }),
      redo: () => dispatch({ type: A.REDO }),
      markSaved: (version, changeId) => dispatch({ type: A.SAVE_SUCCESS, version, changeId }),
      getState: get,
    };
  }, []);

  const ui = useMemo(
    () => ({
      zoom,
      setZoom: (value) => setZoomState(Math.min(ZOOM_LIMITS.max, Math.max(ZOOM_LIMITS.min, Math.round(value * 100) / 100))),
      zoomLimits: ZOOM_LIMITS,
      showGuides,
      setShowGuides,
      snapEnabled,
      setSnapEnabled,
      editingId,
      setEditingId,
      // "Ajustar a la ventana": el lienzo escucha este contador y recalcula el zoom.
      fitRequest,
      requestFit: () => setFitRequest((n) => n + 1),
    }),
    [zoom, showGuides, snapEnabled, editingId, fitRequest],
  );

  return (
    <EditorActionsContext.Provider value={actions}>
      <EditorUiContext.Provider value={ui}>
        <EditorStateContext.Provider value={state}>{children}</EditorStateContext.Provider>
      </EditorUiContext.Provider>
    </EditorActionsContext.Provider>
  );
}

function useRequired(context, name) {
  const value = useContext(context);
  if (!value) throw new Error(`${name} debe usarse dentro de <EditorProvider>`);
  return value;
}

export const useEditorState = () => useRequired(EditorStateContext, 'useEditorState');
export const useEditorActions = () => useRequired(EditorActionsContext, 'useEditorActions');
export const useEditorUi = () => useRequired(EditorUiContext, 'useEditorUi');
