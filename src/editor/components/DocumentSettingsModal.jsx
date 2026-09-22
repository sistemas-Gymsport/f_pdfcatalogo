import { useState } from 'react';
import { CatalogForm } from '../../components/catalog/CatalogForm.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useEditorConfig } from '../../hooks/useEditorConfig.js';
import { useUpdateCatalog } from '../../hooks/useCatalogs.js';
import { fieldErrors } from '../../utils/errors.js';
import { useEditorActions, useEditorState } from '../state/EditorContext.jsx';

/** Configuración del documento (formato, márgenes, colores) sin salir del editor. */
export function DocumentSettingsModal({ open, onClose }) {
  const { catalog } = useEditorState();
  const actions = useEditorActions();
  const config = useEditorConfig();
  const update = useUpdateCatalog();
  const toast = useToast();
  const [serverErrors, setServerErrors] = useState({});

  const onSubmit = async (values) => {
    setServerErrors({});
    try {
      const updated = await update.mutateAsync({ id: catalog.id, data: values });
      actions.setCatalog(updated);
      toast.success('Configuración del documento actualizada');
      onClose();
    } catch (error) {
      setServerErrors(fieldErrors(error));
      toast.error(error.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Configurar documento" description="Los cambios de colores se aplican a todos los elementos que usan los colores del catálogo." size="xl" locked={update.isPending}>
      {config.isLoading ? (
        <Loading />
      ) : (
        <CatalogForm
          compact
          catalog={catalog}
          config={config.data}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Aplicar cambios"
          loading={update.isPending}
          serverErrors={serverErrors}
        />
      )}
    </Modal>
  );
}
