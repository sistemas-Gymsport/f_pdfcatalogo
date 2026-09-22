import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { useEditorActions, useEditorState } from '../state/EditorContext.jsx';
import { PageThumbnail } from './PageThumbnail.jsx';
import './SidePanels.css';

/** Lista de páginas: seleccionar, agregar, duplicar, eliminar y reordenar (arrastrar o flechas). */
export function PagesPanel() {
  const { pages, catalog, currentPageId } = useEditorState();
  const actions = useEditorActions();
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const onDelete = useCallback(
    (page) => (page.elements.length ? setToDelete(page) : actions.deletePage(page.id)),
    [actions],
  );

  const dragHandlers = (index) => ({
    onDragStart: (event) => {
      setDragIndex(index);
      event.dataTransfer.effectAllowed = 'move';
    },
    onDragOver: (event) => {
      event.preventDefault();
      if (overIndex !== index) setOverIndex(index);
    },
    onDragLeave: () => setOverIndex((current) => (current === index ? null : current)),
    onDrop: (event) => {
      event.preventDefault();
      if (dragIndex !== null) actions.movePage(dragIndex, index);
      setDragIndex(null);
      setOverIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
      setOverIndex(null);
    },
  });

  return (
    <section className="side-section side-section--pages" aria-labelledby="pages-title">
      <div className="side-section__header">
        <h2 id="pages-title" className="side-section__title">
          Páginas <span className="side-section__count">{pages.length}</span>
        </h2>
        <Button size="sm" variant="ghost" icon={Plus} tooltip="Agregar página" onClick={actions.addPage} />
      </div>

      <div className="pages-list">
        {pages.map((page, index) => (
          <PageThumbnail
            key={page.id}
            page={page}
            index={index}
            total={pages.length}
            catalog={catalog}
            active={page.id === currentPageId}
            dragOver={overIndex === index && dragIndex !== index}
            onSelect={actions.selectPage}
            onDuplicate={actions.duplicatePage}
            onDelete={onDelete}
            onMove={actions.movePage}
            dragHandlers={dragHandlers(index)}
          />
        ))}
        <Button icon={Plus} block onClick={actions.addPage}>
          Agregar página
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar página"
        message={`La página tiene ${toDelete?.elements.length} elemento(s). Podrás deshacer con Ctrl+Z antes de guardar.`}
        onConfirm={() => {
          actions.deletePage(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
