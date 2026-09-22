import { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useCatalogs, useDeleteCatalog, useDuplicateCatalog } from '../hooks/useCatalogs.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { CatalogCard } from '../components/catalog/CatalogCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { SearchInput } from '../components/ui/Controls.jsx';
import { EmptyState, ErrorState } from '../components/ui/EmptyState.jsx';
import { Loading } from '../components/ui/Loading.jsx';
import '../components/catalog/CatalogCard.css';

export default function CatalogsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search.trim(), 300);
  const { data: catalogs = [], isLoading, isError, error, refetch } = useCatalogs(debounced);
  const duplicate = useDuplicateCatalog();
  const remove = useDeleteCatalog();
  const toast = useToast();
  const [toDelete, setToDelete] = useState(null);

  const onDuplicate = async (catalog) => {
    try {
      const copy = await duplicate.mutateAsync(catalog.id);
      toast.success(`Se creó "${copy.name}"`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onConfirmDelete = async () => {
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success(`"${toDelete.name}" eliminado`);
      setToDelete(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const newButton = (
    <Button variant="primary" icon={Plus} to="/admin/catalogos/nuevo">
      Nuevo catálogo
    </Button>
  );

  return (
    <>
      <PageHeader title="Catálogos" description="Diseña, duplica y genera tus catálogos en PDF." actions={newButton} />

      <div className="row" style={{ marginBottom: 20 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar catálogo…" />
      </div>

      {isLoading ? (
        <Loading label="Cargando catálogos…" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : catalogs.length === 0 ? (
        debounced ? (
          <EmptyState icon={BookOpen} title="Sin resultados" description={`Ningún catálogo coincide con "${debounced}".`} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Aún no hay catálogos"
            description="Crea tu primer catálogo: elige el formato de página, los márgenes y los colores, y comienza a diseñar."
            action={newButton}
          />
        )
      ) : (
        <div className="catalog-grid">
          {catalogs.map((catalog) => (
            <CatalogCard
              key={catalog.id}
              catalog={catalog}
              onDuplicate={onDuplicate}
              onDelete={setToDelete}
              duplicating={duplicate.isPending && duplicate.variables === catalog.id}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar catálogo"
        message={`Se eliminará "${toDelete?.name}" con todas sus páginas y elementos. Las imágenes de la biblioteca no se borran. Esta acción no se puede deshacer.`}
        loading={remove.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
