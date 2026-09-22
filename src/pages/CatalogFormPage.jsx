import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCatalog, useCreateCatalog, useUpdateCatalog } from '../hooks/useCatalogs.js';
import { useEditorConfig } from '../hooks/useEditorConfig.js';
import { useToast } from '../context/ToastContext.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { CatalogForm } from '../components/catalog/CatalogForm.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ErrorState } from '../components/ui/EmptyState.jsx';
import { Loading } from '../components/ui/Loading.jsx';
import { fieldErrors } from '../utils/errors.js';

/** Crear (/admin/catalogos/nuevo) o configurar (/admin/catalogos/:id/configuracion). */
export default function CatalogFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const config = useEditorConfig();
  const catalog = useCatalog(id);
  const create = useCreateCatalog();
  const update = useUpdateCatalog();
  const [serverErrors, setServerErrors] = useState({});

  const onSubmit = async (values) => {
    setServerErrors({});
    try {
      if (isEdit) {
        await update.mutateAsync({ id, data: values });
        toast.success('Configuración guardada');
        navigate(`/admin/catalogos/${id}`);
      } else {
        const created = await create.mutateAsync(values);
        toast.success('Catálogo creado. ¡Comienza a diseñar!');
        navigate(`/admin/catalogos/${created.id}`, { replace: true });
      }
    } catch (error) {
      setServerErrors(fieldErrors(error));
      toast.error(error.message);
    }
  };

  const loading = config.isLoading || (isEdit && catalog.isLoading);
  const error = config.error || (isEdit && catalog.error);

  return (
    <>
      <PageHeader
        title={isEdit ? 'Configurar documento' : 'Nuevo catálogo'}
        description={isEdit ? catalog.data?.name : 'Define el formato de las hojas, los márgenes y la paleta de colores.'}
        actions={
          <Button variant="ghost" icon={ArrowLeft} to={isEdit ? `/admin/catalogos/${id}` : '/admin/catalogos'}>
            Volver
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => (isEdit ? catalog.refetch() : config.refetch())} />
      ) : (
        <CatalogForm
          key={catalog.data?.id || 'new'}
          catalog={isEdit ? catalog.data : null}
          config={config.data}
          onSubmit={onSubmit}
          onCancel={() => navigate(-1)}
          submitLabel={isEdit ? 'Guardar configuración' : 'Crear y abrir editor'}
          loading={create.isPending || update.isPending}
          serverErrors={serverErrors}
        />
      )}
    </>
  );
}
