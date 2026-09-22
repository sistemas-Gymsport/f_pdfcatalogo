import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { catalogCssVars, cleanStyle, pageStyle, sortElements } from '../../shared/renderModel.js';
import { useEditorActions, useEditorState, useEditorUi } from '../state/EditorContext.jsx';
import { selectCurrentPage } from '../state/editorReducer.js';
import { mmToPx, pageGuides } from '../utils/geometry.js';
import { PdfElement, SelectionOverlay } from './PdfElement.jsx';
import './PdfCanvas.css';

const CANVAS_PADDING = 64;

/**
 * Hoja de trabajo: la página se dibuja a tamaño real (mm) y se escala con
 * transform para el zoom. Los elementos usan el mismo modelo de estilos
 * que el PDF.
 */
export function PdfCanvas() {
  const state = useEditorState();
  const actions = useEditorActions();
  const ui = useEditorUi();
  const { catalog } = state;
  const page = selectCurrentPage(state);
  const scrollRef = useRef(null);
  const [snapLines, setSnapLines] = useState(null);
  // Geometría temporal mientras se arrastra/redimensiona (no entra al historial).
  const [live, setLive] = useState(null);
  const { zoom, setZoom, setEditingId } = ui;
  const stopEditing = useCallback(() => setEditingId(null), [setEditingId]);

  const size = { width: catalog.pageWidth, height: catalog.pageHeight };
  const guides = useMemo(() => pageGuides(catalog), [catalog]);
  const selected = useMemo(() => new Set(state.selectedIds), [state.selectedIds]);

  const fit = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scale = Math.min(
      (el.clientWidth - CANVAS_PADDING) / mmToPx(size.width),
      (el.clientHeight - CANVAS_PADDING) / mmToPx(size.height),
    );
    setZoom(Math.max(0.25, Math.min(scale, 1.5)));
  }, [size.width, size.height, setZoom]);

  // Ajusta el zoom al abrir el catálogo, al cambiar el tamaño de hoja o al pedirlo desde la barra.
  useLayoutEffect(() => {
    fit();
  }, [fit, ui.fitRequest]);

  // Ctrl + rueda del mouse = zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, setZoom]);

  const onBackgroundMouseDown = (event) => {
    if (event.target === event.currentTarget || event.target.dataset.canvasBg !== undefined) {
      // Confirma primero una edición de texto en curso (el blur guarda el contenido).
      if (document.activeElement?.classList.contains('pdf-el__editor')) document.activeElement.blur();
      actions.clearSelection();
      setEditingId(null);
    }
  };

  if (!page) return <div className="canvas" />;

  const withLive = (el) => (live?.id === el.id ? { ...el, ...live } : el);
  // Durante un arrastre react-draggable controla la posición del elemento; solo el
  // redimensionado (desde la capa de selección) le aplica la geometría en vivo.
  const elementWithLive = (el) => (live?.id === el.id && live.width !== undefined ? withLive(el) : el);
  const selectedElement = state.selectedIds.length === 1 ? page.elements.find((el) => el.id === state.selectedIds[0]) : null;
  const showOverlay = selectedElement && !selectedElement.locked && ui.editingId !== selectedElement.id;

  const sheetStyle = {
    ...cleanStyle(pageStyle(page, size)),
    ...catalogCssVars(catalog),
    '--zoom': zoom,
    transform: `scale(${zoom})`,
  };

  return (
    <div className="canvas" ref={scrollRef} onMouseDown={onBackgroundMouseDown}>
      <div className="canvas__stage" data-canvas-bg="" style={{ width: mmToPx(size.width) * zoom, height: mmToPx(size.height) * zoom }}>
        <div className="canvas__sheet" data-canvas-bg="" style={sheetStyle} aria-label="Página en edición">
          {sortElements(page.elements).map((element) => (
            <PdfElement
              key={element.id}
              element={elementWithLive(element)}
              selected={selected.has(element.id)}
              zoom={zoom}
              editing={ui.editingId === element.id}
              onStartEditing={setEditingId}
              onStopEditing={stopEditing}
              snap={ui.snapEnabled}
              guides={guides}
              snapThreshold={2 / zoom}
              onGuidesChange={setSnapLines}
              onLiveChange={setLive}
            />
          ))}

          {showOverlay && <SelectionOverlay element={withLive(selectedElement)} zoom={zoom} onLiveChange={setLive} />}

          {ui.showGuides && (
            <div
              className="canvas__margins"
              style={{ left: `${catalog.marginLeft}mm`, top: `${catalog.marginTop}mm`, right: `${catalog.marginRight}mm`, bottom: `${catalog.marginBottom}mm` }}
              aria-hidden="true"
            />
          )}
          {snapLines?.x != null && <div className="canvas__snap canvas__snap--x" style={{ left: `${snapLines.x}mm` }} />}
          {snapLines?.y != null && <div className="canvas__snap canvas__snap--y" style={{ top: `${snapLines.y}mm` }} />}
        </div>
      </div>
    </div>
  );
}
