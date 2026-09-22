import { useEffect, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService.js';
import { catalogKeys } from '../hooks/useCatalogs.js';
import { useToast } from '../context/ToastContext.jsx';
import { EditorProvider, useEditorActions, useEditorState } from '../editor/state/EditorContext.jsx';
import { selectSelectedElements } from '../editor/state/editorReducer.js';
import { useDocumentSave } from '../editor/hooks/useDocumentSave.js';
import { useEditorShortcuts } from '../editor/hooks/useEditorShortcuts.js';
import { EditorToolbar } from '../editor/components/EditorToolbar.jsx';
import { ElementsPanel } from '../editor/components/ElementsPanel.jsx';
import { PagesPanel } from '../editor/components/PagesPanel.jsx';
import { PdfCanvas } from '../editor/components/PdfCanvas.jsx';
import { PropertiesPanel } from '../editor/components/properties/PropertiesPanel.jsx';
import { DocumentSettingsModal } from '../editor/components/DocumentSettingsModal.jsx';
import { ImagePickerModal } from '../components/images/ImagePickerModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ErrorState } from '../components/ui/EmptyState.jsx';
import { Loading } from '../components/ui/Loading.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import './CatalogEditorPage.css';

/** Diálogo al salir con cambios sin guardar. */
function UnsavedChangesDialog({ blocker, onSave }) {
  const [saving, setSaving] = useState(false);
  if (blocker.state !== 'blocked') return null;

  const saveAndLeave = async () => {
    setSaving(true);
    const ok = await onSave();
    setSaving(false);
    if (ok) blocker.proceed();
  };

  return (
    <Modal
      open
      onClose={() => blocker.reset()}
      title="Hay cambios sin guardar"
      size="sm"
      locked={saving}
      footer={
        <>
          <Button onClick={() => blocker.reset()} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="ghost" onClick={() => blocker.proceed()} disabled={saving}>
            Salir sin guardar
          </Button>
          <Button variant="primary" onClick={saveAndLeave} loading={saving} data-autofocus>
            Guardar y salir
          </Button>
        </>
      }
    >
      <p className="text-muted">Si sales ahora perderás los últimos cambios del diseño.</p>
    </Modal>
  );
}

function EditorScreen({ catalogId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const state = useEditorState();
  const actions = useEditorActions();
  const [imagePicker, setImagePicker] = useState(null); // { mode: 'add' | 'replace', elementId? }
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Siempre se carga la versión más reciente desde la base de datos.
  const query = useQuery({
    queryKey: catalogKeys.detail(catalogId),
    queryFn: () => catalogService.get(catalogId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.data && query.isFetchedAfterMount && !query.isFetching && state.catalog?.id !== query.data.id) {
      actions.load(query.data);
    }
  }, [query.data, query.isFetchedAfterMount, query.isFetching, state.catalog?.id, actions]);

  const saveState = useDocumentSave(catalogId);
  const { save, dirty } = saveState;

  const manualSave = async () => {
    if (!dirty) {
      toast.info('No hay cambios pendientes: todo está guardado.');
      return true;
    }
    const ok = await save();
    if (ok) toast.success('Catálogo guardado');
    return ok;
  };

  useEditorShortcuts({ onSave: manualSave });

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  /** Guarda (si hace falta) y navega; el PDF y la vista previa usan los datos guardados. */
  const saveThenGo = async (path) => {
    setBusy(true);
    const ok = dirty ? await save() : true;
    setBusy(false);
    if (ok) navigate(path);
  };

  const openImagePicker = () => {
    const [selected] = selectSelectedElements(state);
    if (selected?.type === 'image') setImagePicker({ mode: 'replace', elementId: selected.id, currentImageId: selected.imageId });
    else setImagePicker({ mode: 'add' });
  };

  const onImageSelected = (image) => {
    if (imagePicker?.mode === 'replace') actions.setElementImage(imagePicker.elementId, image);
    else actions.addImageElement(image);
    setImagePicker(null);
  };

  if (query.isError) {
    return (
      <div className="editor-state">
        <ErrorState title="No se pudo abrir el catálogo" error={query.error} onRetry={query.refetch} />
        <Button to="/admin/catalogos">Volver a catálogos</Button>
      </div>
    );
  }

  if (!state.catalog) return <Loading fullscreen label="Abriendo editor…" />;

  return (
    <div className="editor">
      <EditorToolbar
        saveState={saveState}
        busy={busy}
        onBack={() => navigate('/admin/catalogos')}
        onSave={manualSave}
        onPreview={() => saveThenGo(`/admin/catalogos/${catalogId}/vista-previa`)}
        onGeneratePdf={() => saveThenGo(`/admin/catalogos/${catalogId}/vista-previa?pdf=1`)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="editor__body">
        <aside className="editor__left">
          <ElementsPanel onAddImage={() => setImagePicker({ mode: 'add' })} />
          <PagesPanel />
        </aside>

        <PdfCanvas />

        <PropertiesPanel onPickImage={openImagePicker} onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      <ImagePickerModal
        open={Boolean(imagePicker)}
        title={imagePicker?.mode === 'replace' ? 'Cambiar imagen' : 'Agregar imagen'}
        currentImageId={imagePicker?.currentImageId}
        onClose={() => setImagePicker(null)}
        onSelect={onImageSelected}
      />
      <DocumentSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <UnsavedChangesDialog blocker={blocker} onSave={save} />
    </div>
  );
}

export default function CatalogEditorPage() {
  const { id } = useParams();
  return (
    <EditorProvider key={id}>
      <EditorScreen catalogId={id} />
    </EditorProvider>
  );
}
