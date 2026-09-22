import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { cn } from '../../../utils/cn.js';
import { getElementMeta } from '../../elementRegistry.js';
import { useEditorActions } from '../../state/EditorContext.jsx';
import { PropSection } from './PropSection.jsx';

function layerName(el) {
  if (el.type === 'image') return el.image?.name || 'Imagen sin elegir';
  const text = (el.content || '').trim().replace(/\s+/g, ' ');
  return text ? text.slice(0, 40) : getElementMeta(el.type).label;
}

/**
 * Lista de capas de la página (de arriba hacia abajo). Permite seleccionar
 * elementos que quedaron tapados por otros, y ocultarlos o bloquearlos.
 */
export function LayersSection({ page, selectedIds }) {
  const actions = useEditorActions();
  const items = [...page.elements].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
  const selected = new Set(selectedIds);

  return (
    <PropSection title={`Capas de la página (${items.length})`}>
      {items.length === 0 ? (
        <p className="prop-hint">La página está vacía. Usa el panel "Agregar elementos" de la izquierda.</p>
      ) : (
        <ul className="layers" aria-label="Capas">
          {items.map((el) => {
            const { icon: Icon, label } = getElementMeta(el.type);
            return (
              <li key={el.id} data-layer-id={el.id} className={cn('layer', selected.has(el.id) && 'is-selected', el.hidden && 'is-hidden')}>
                <button type="button" className="layer__main" onClick={(e) => actions.selectElement(el.id, e.shiftKey)} title={`${label}: ${layerName(el)}`}>
                  <Icon size={14} aria-hidden="true" />
                  <span>{layerName(el)}</span>
                </button>
                <button
                  type="button"
                  className="layer__toggle"
                  onClick={() => actions.updateElement(el.id, { hidden: !el.hidden })}
                  data-tooltip={el.hidden ? 'Mostrar' : 'Ocultar'}
                  data-tooltip-pos="top"
                  aria-label={el.hidden ? 'Mostrar elemento' : 'Ocultar elemento'}
                >
                  {el.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="button"
                  className={cn('layer__toggle', el.locked && 'is-on')}
                  onClick={() => actions.updateElement(el.id, { locked: !el.locked })}
                  data-tooltip={el.locked ? 'Desbloquear' : 'Bloquear'}
                  data-tooltip-pos="top"
                  aria-label={el.locked ? 'Desbloquear elemento' : 'Bloquear elemento'}
                >
                  {el.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="prop-hint">La primera de la lista es la que está más al frente.</p>
    </PropSection>
  );
}
