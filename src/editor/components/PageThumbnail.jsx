import { memo } from 'react';
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import { StaticPage } from '../../components/pdf/StaticPage.jsx';
import { cn } from '../../utils/cn.js';

/** Miniatura de página con acciones rápidas. Arrastrable para reordenar. */
export const PageThumbnail = memo(function PageThumbnail({
  page,
  index,
  total,
  catalog,
  active,
  dragOver,
  onSelect,
  onDuplicate,
  onDelete,
  onMove,
  dragHandlers,
}) {
  const stop = (fn) => (event) => {
    event.stopPropagation();
    fn();
  };

  return (
    <div
      className={cn('page-thumb', active && 'is-active', dragOver && 'is-drag-over')}
      draggable
      {...dragHandlers}
      onClick={() => onSelect(page.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(page.id)}
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
      aria-label={`Página ${index + 1}${page.name ? `: ${page.name}` : ''}`}
    >
      <div className="page-thumb__preview">
        <StaticPage page={page} catalog={catalog} width={catalog.pageWidth > catalog.pageHeight ? 150 : 104} />
        <div className="page-thumb__actions">
          <button type="button" onClick={stop(() => onMove(index, index - 1))} disabled={index === 0} data-tooltip="Mover arriba" data-tooltip-pos="right" aria-label="Mover página arriba">
            <ArrowUp size={13} />
          </button>
          <button type="button" onClick={stop(() => onMove(index, index + 1))} disabled={index === total - 1} data-tooltip="Mover abajo" data-tooltip-pos="right" aria-label="Mover página abajo">
            <ArrowDown size={13} />
          </button>
          <button type="button" onClick={stop(() => onDuplicate(page.id))} data-tooltip="Duplicar página" data-tooltip-pos="right" aria-label="Duplicar página">
            <Copy size={13} />
          </button>
          <button type="button" onClick={stop(() => onDelete(page))} disabled={total <= 1} data-tooltip="Eliminar página" data-tooltip-pos="right" aria-label="Eliminar página" className="page-thumb__delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <span className="page-thumb__label">
        Página {index + 1}
        {page.name && <small> · {page.name}</small>}
      </span>
    </div>
  );
});
