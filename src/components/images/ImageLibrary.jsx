import { useState } from 'react';
import { Images } from 'lucide-react';
import { useDeleteImage, useImages } from '../../hooks/useImages.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useToast } from '../../context/ToastContext.jsx';
import { cn } from '../../utils/cn.js';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { SearchInput } from '../ui/Controls.jsx';
import { EmptyState, ErrorState } from '../ui/EmptyState.jsx';
import { Loading } from '../ui/Loading.jsx';
import { ImageCard } from './ImageCard.jsx';
import { ImageEditModal } from './ImageEditModal.jsx';

/**
 * Biblioteca de imágenes.
 * - mode="manage": editar y eliminar (pantalla Imágenes).
 * - mode="select": elegir una imagen (editor).
 */
export function ImageLibrary({ mode = 'manage', selectedId, onSelect, compact = false, emptyAction }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { data: images = [], isLoading, isError, error, refetch, isFetching } = useImages(debouncedSearch);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteImage = useDeleteImage();
  const toast = useToast();

  const confirmDelete = async () => {
    try {
      await deleteImage.mutateAsync(deleting.id);
      toast.success(`"${deleting.name}" eliminada de la biblioteca y de Cloudinary`);
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
      setDeleting(null);
    }
  };

  const manage = mode === 'manage';

  return (
    <div className="stack">
      <div className="row">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o descripción…" />
        {isFetching && !isLoading && <span className="text-muted" style={{ fontSize: 12 }}>Actualizando…</span>}
      </div>

      {isLoading ? (
        <Loading label="Cargando imágenes…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : images.length === 0 ? (
        debouncedSearch ? (
          <EmptyState compact icon={Images} title="Sin resultados" description={`No hay imágenes que coincidan con "${debouncedSearch}".`} />
        ) : (
          <EmptyState compact={compact} icon={Images} title="Aún no hay imágenes" description="Sube tu primera imagen para usarla en tus catálogos." action={emptyAction} />
        )
      ) : (
        <div className={cn('image-grid', compact && 'image-grid--compact')}>
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              selectable={!manage}
              selected={selectedId === image.id}
              onSelect={onSelect}
              onEdit={manage ? setEditing : undefined}
              onDelete={manage ? setDeleting : undefined}
            />
          ))}
        </div>
      )}

      {manage && (
        <>
          <ImageEditModal image={editing} onClose={() => setEditing(null)} />
          {deleting?.usageCount ? (
            <ConfirmDialog
              open
              title="Esta imagen está en uso"
              message={`"${deleting.name}" se usa en ${deleting.usageCount} elemento(s) de tus catálogos. Para no romper esos diseños no se puede eliminar: primero quítala o cámbiala en el editor.`}
              confirmLabel="Entendido"
              cancelLabel="Cerrar"
              variant="primary"
              onConfirm={() => setDeleting(null)}
              onCancel={() => setDeleting(null)}
            />
          ) : (
            <ConfirmDialog
              open={Boolean(deleting)}
              title="Eliminar imagen"
              message={`Se eliminará "${deleting?.name}" de la biblioteca y de Cloudinary. Esta acción no se puede deshacer.`}
              loading={deleteImage.isPending}
              onConfirm={confirmDelete}
              onCancel={() => setDeleting(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
