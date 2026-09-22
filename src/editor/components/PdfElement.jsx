import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { Lock } from 'lucide-react';
import { ElementContent } from '../../components/pdf/ElementContent.jsx';
import { TEXT_TYPES } from '../../shared/renderModel.js';
import { cn } from '../../utils/cn.js';
import { mmToPx, pxToMm, snapRect } from '../utils/geometry.js';
import { measureTextHeight } from '../utils/measure.js';
import { useEditorActions } from '../state/EditorContext.jsx';

/** Detecta si el texto se desborda del recuadro (se cortaría en el PDF). */
function useTextOverflow(element, enabled) {
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    if (!enabled) {
      setOverflowing(false);
      return;
    }
    const needed = measureTextHeight(element.id);
    setOverflowing(needed !== null && needed > element.height + 0.3);
    // Las fuentes web pueden terminar de cargar después: se vuelve a medir.
    document.fonts?.ready.then(() => {
      const again = measureTextHeight(element.id);
      setOverflowing(again !== null && again > element.height + 0.3);
    });
  }, [enabled, element.id, element.content, element.height, element.width, element.fontSize, element.fontFamily, element.fontWeight, element.lineHeight, element.letterSpacing, element.padding]);
  return overflowing;
}

/** Edición de texto directamente sobre la hoja (doble clic). */
function InlineTextEditor({ element, onDone }) {
  const [value, setValue] = useState(element.content || '');
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <textarea
      ref={ref}
      className="pdf-el__editor"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onDone(value)}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) e.currentTarget.blur();
      }}
      aria-label="Editar texto"
    />
  );
}

/**
 * Elemento sobre la hoja: seleccionar y mover (react-rnd). Conserva su capa
 * real (zIndex); el redimensionado lo hace SelectionOverlay, que siempre está
 * por encima para que los tiradores nunca queden tapados.
 * Trabaja en px CSS sin escalar (el zoom lo aplica el contenedor con
 * transform:scale y se informa a react-rnd con "scale"). Se guarda en mm.
 */
export const PdfElement = memo(function PdfElement({
  element,
  selected,
  zoom,
  editing,
  onStartEditing,
  onStopEditing,
  snap,
  guides,
  snapThreshold,
  onGuidesChange,
  onLiveChange,
}) {
  const actions = useEditorActions();
  const isText = TEXT_TYPES.includes(element.type);
  const locked = element.locked;
  const overflowing = useTextOverflow(element, isText && !editing);

  const onMouseDown = (event) => {
    if (event.button !== 0) return;
    if (!selected || event.shiftKey) actions.selectElement(element.id, event.shiftKey);
  };

  const snapped = (x, y) => (snap ? snapRect({ x, y, width: element.width, height: element.height }, guides, snapThreshold) : { x, y, lines: null });

  const onDrag = (_event, data) => {
    const x = pxToMm(data.x);
    const y = pxToMm(data.y);
    onLiveChange({ id: element.id, x, y });
    if (snap) onGuidesChange(snapped(x, y).lines);
  };

  const onDragStop = (_event, data) => {
    onGuidesChange(null);
    onLiveChange(null);
    const { x, y } = snapped(pxToMm(data.x), pxToMm(data.y));
    if (Math.abs(x - element.x) < 0.01 && Math.abs(y - element.y) < 0.01) return;
    actions.updateElement(element.id, { x, y });
  };

  return (
    <Rnd
      className={cn('pdf-el', `pdf-el--${element.type}`, selected && 'is-selected', locked && 'is-locked', element.hidden && 'is-hidden', editing && 'is-editing', overflowing && 'is-overflowing')}
      data-element-id={element.id}
      size={{ width: mmToPx(element.width), height: mmToPx(element.height) }}
      position={{ x: mmToPx(element.x), y: mmToPx(element.y) }}
      scale={zoom}
      style={{ zIndex: element.zIndex ?? 0 }}
      disableDragging={locked || editing}
      enableResizing={false}
      cancel=".pdf-el__editor"
      onMouseDown={onMouseDown}
      onDoubleClick={() => isText && !locked && onStartEditing(element.id)}
      onDrag={onDrag}
      onDragStop={onDragStop}
    >
      <ElementContent
        element={element}
        showPlaceholder
        textSlot={
          editing ? (
            <InlineTextEditor
              element={element}
              onDone={(value) => {
                if (value !== (element.content || '')) actions.updateElement(element.id, { content: value });
                onStopEditing();
              }}
            />
          ) : null
        }
      />
      {overflowing && (
        <span className="pdf-el__overflow" style={{ transform: `scale(${1 / zoom})` }} title="El texto no cabe en el recuadro y se cortará en el PDF">
          Texto recortado
        </span>
      )}
      {selected && locked && (
        <span className="pdf-el__lock" style={{ transform: `scale(${1 / zoom})` }}>
          <Lock size={12} />
        </span>
      )}
    </Rnd>
  );
});

const HANDLES = ['top', 'right', 'bottom', 'left', 'topRight', 'bottomRight', 'bottomLeft', 'topLeft'];

function handleStyles(zoom) {
  const size = 12 / zoom;
  const offset = -size / 2;
  return Object.fromEntries(
    HANDLES.map((h) => {
      const corner = h.length > 6;
      const vertical = h === 'top' || h === 'bottom';
      const style = corner
        ? { width: size, height: size }
        : vertical
          ? { height: size, left: size, right: size, width: 'auto' }
          : { width: size, top: size, bottom: size, height: 'auto' };
      const lower = h.toLowerCase();
      if (lower.includes('top')) style.top = offset;
      if (lower.includes('bottom')) style.bottom = offset;
      if (lower.includes('left')) style.left = offset;
      if (lower.includes('right')) style.right = offset;
      style.pointerEvents = 'auto';
      return [h, style];
    }),
  );
}

/**
 * Marco de selección con tiradores de tamaño, siempre por encima de todos los
 * elementos. Solo sus tiradores reciben eventos del mouse.
 */
export function SelectionOverlay({ element, zoom, onLiveChange }) {
  const actions = useEditorActions();

  const toMm = (ref, position) => ({
    width: pxToMm(parseFloat(ref.style.width)),
    height: pxToMm(parseFloat(ref.style.height)),
    x: pxToMm(position.x),
    y: pxToMm(position.y),
  });

  return (
    <Rnd
      className="selection-overlay"
      size={{ width: mmToPx(element.width), height: mmToPx(element.height) }}
      position={{ x: mmToPx(element.x), y: mmToPx(element.y) }}
      scale={zoom}
      style={{ zIndex: 100002, pointerEvents: 'none' }}
      disableDragging
      enableResizing
      resizeHandleStyles={handleStyles(zoom)}
      resizeHandleClasses={Object.fromEntries(HANDLES.map((h) => [h, `pdf-el__handle pdf-el__handle--${h.length > 6 ? 'corner' : 'edge'}`]))}
      minWidth={mmToPx(1)}
      minHeight={mmToPx(1)}
      onResize={(_e, _dir, ref, _delta, position) => onLiveChange({ id: element.id, ...toMm(ref, position) })}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        onLiveChange(null);
        actions.updateElement(element.id, toMm(ref, position));
      }}
    >
      {element.rotation ? (
        <span className="selection-overlay__rotated" style={{ transform: `rotate(${element.rotation}deg)` }} aria-hidden="true" />
      ) : null}
      <span className="selection-overlay__size" style={{ transform: `translateX(-50%) scale(${1 / zoom})` }}>
        {Math.round(element.width * 10) / 10} × {Math.round(element.height * 10) / 10} mm
      </span>
    </Rnd>
  );
}
