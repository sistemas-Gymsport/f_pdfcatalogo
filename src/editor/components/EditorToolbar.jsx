import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  FileDown,
  Grid2x2Check,
  Loader2,
  Magnet,
  Redo2,
  Save,
  Settings2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Switch } from '../../components/ui/Controls.jsx';
import { formatRelative } from '../../utils/format.js';
import { useEditorActions, useEditorState, useEditorUi } from '../state/EditorContext.jsx';
import './EditorToolbar.css';

function SaveStatus({ status, dirty }) {
  if (status.saving) {
    return (
      <span className="save-status">
        <Loader2 size={14} className="save-status__spin" /> Guardando…
      </span>
    );
  }
  if (status.error) {
    return (
      <span className="save-status save-status--error" title={status.error.message}>
        <AlertCircle size={14} /> {status.conflict ? 'Conflicto de versión' : 'Error al guardar'}
      </span>
    );
  }
  if (dirty) return <span className="save-status save-status--dirty">● Cambios sin guardar</span>;
  return (
    <span className="save-status save-status--ok">
      <Check size={14} /> {status.lastSavedAt ? `Guardado ${formatRelative(status.lastSavedAt)}` : 'Todo guardado'}
    </span>
  );
}

export function EditorToolbar({ saveState, onBack, onSave, onPreview, onGeneratePdf, onOpenSettings, busy }) {
  const { catalog, past, future } = useEditorState();
  const actions = useEditorActions();
  const ui = useEditorUi();

  return (
    <header className="toolbar">
      <div className="toolbar__group toolbar__group--left">
        <Button variant="ghost" icon={ArrowLeft} tooltip="Volver a catálogos" onClick={onBack} />
        <div className="toolbar__doc">
          <strong title={catalog.name}>{catalog.name}</strong>
          <SaveStatus status={saveState.status} dirty={saveState.dirty} />
        </div>
      </div>

      <div className="toolbar__group toolbar__group--center">
        <Button variant="ghost" size="sm" icon={Undo2} tooltip="Deshacer (Ctrl+Z)" disabled={!past.length} onClick={actions.undo} />
        <Button variant="ghost" size="sm" icon={Redo2} tooltip="Rehacer (Ctrl+Y)" disabled={!future.length} onClick={actions.redo} />
        <span className="toolbar__divider" />
        <Button variant="ghost" size="sm" icon={ZoomOut} tooltip="Alejar (Ctrl -)" onClick={() => ui.setZoom(ui.zoom / 1.2)} disabled={ui.zoom <= ui.zoomLimits.min} />
        <button type="button" className="toolbar__zoom" onClick={ui.requestFit} data-tooltip="Ajustar a la ventana (Ctrl 0)">
          {Math.round(ui.zoom * 100)}%
        </button>
        <Button variant="ghost" size="sm" icon={ZoomIn} tooltip="Acercar (Ctrl +)" onClick={() => ui.setZoom(ui.zoom * 1.2)} disabled={ui.zoom >= ui.zoomLimits.max} />
        <span className="toolbar__divider" />
        <Button variant="ghost" size="sm" icon={Grid2x2Check} active={ui.showGuides} tooltip={ui.showGuides ? 'Ocultar guías de márgenes' : 'Mostrar guías de márgenes'} onClick={() => ui.setShowGuides(!ui.showGuides)} />
        <Button variant="ghost" size="sm" icon={Magnet} active={ui.snapEnabled} tooltip={ui.snapEnabled ? 'Desactivar imán (ajuste a márgenes y centro)' : 'Activar imán'} onClick={() => ui.setSnapEnabled(!ui.snapEnabled)} />
      </div>

      <div className="toolbar__group toolbar__group--right">
        <div
          className="toolbar__autosave"
          data-tooltip={saveState.autosave ? 'Autoguardado activado: se guarda solo al dejar de editar' : 'Autoguardado desactivado: usa Guardar o Ctrl+S'}
        >
          <Switch checked={saveState.autosave} onChange={saveState.setAutosave} label="Autoguardado" />
        </div>
        <Button variant="ghost" icon={Settings2} tooltip="Configurar documento" onClick={onOpenSettings} />
        <Button icon={Save} onClick={onSave} loading={saveState.status.saving} disabled={busy}>
          Guardar
        </Button>
        <Button icon={Eye} onClick={onPreview} disabled={busy}>
          Vista previa
        </Button>
        <Button variant="primary" icon={FileDown} onClick={onGeneratePdf} disabled={busy}>
          Generar PDF
        </Button>
      </div>
    </header>
  );
}
