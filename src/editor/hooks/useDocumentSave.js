import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../../services/catalogService.js';
import { catalogKeys } from '../../hooks/useCatalogs.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useEditorActions, useEditorState } from '../state/EditorContext.jsx';
import { toSavePayload } from '../state/documentModel.js';
import { selectIsDirty } from '../state/editorReducer.js';

const AUTOSAVE_DELAY = 2500;
const AUTOSAVE_KEY = 'pdfcatalogo.autosave';

function readAutosavePreference() {
  try {
    return localStorage.getItem(AUTOSAVE_KEY) !== 'off';
  } catch {
    return true;
  }
}

/**
 * Guardado del documento en la base de datos.
 * - save(): envía el documento completo; si ya hay un guardado en curso, encola otro.
 * - autosave: guarda automáticamente unos segundos después del último cambio.
 */
export function useDocumentSave(catalogId) {
  const actions = useEditorActions();
  const state = useEditorState();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState({ saving: false, error: null, conflict: false, lastSavedAt: null });
  const [autosave, setAutosaveState] = useState(readAutosavePreference);
  const inFlight = useRef(null);
  const queued = useRef(false);
  const saveRef = useRef(null);

  const save = useCallback(
    ({ silent = false } = {}) => {
      if (inFlight.current) {
        queued.current = true;
        return inFlight.current;
      }

      const run = async () => {
        const snapshot = actions.getState();
        if (!snapshot.catalog || snapshot.changeId === snapshot.savedChangeId) return true;
        setStatus((s) => ({ ...s, saving: true, error: null }));
        try {
          const saved = await catalogService.saveDocument(catalogId, toSavePayload(snapshot));
          actions.markSaved(saved.version, snapshot.changeId);
          queryClient.setQueryData(catalogKeys.detail(catalogId), saved);
          queryClient.invalidateQueries({ queryKey: ['catalogs', 'list'] });
          queryClient.invalidateQueries({ queryKey: catalogKeys.stats });
          setStatus({ saving: false, error: null, conflict: false, lastSavedAt: new Date() });
          return true;
        } catch (error) {
          const conflict = error.errorCode === 'VERSION_CONFLICT';
          setStatus((s) => ({ ...s, saving: false, error, conflict }));
          if (!silent || conflict) toast.error(error.message, { title: 'No se pudo guardar' });
          return false;
        }
      };

      inFlight.current = run().finally(() => {
        inFlight.current = null;
        // Si hubo cambios mientras se guardaba, se guarda de nuevo al terminar.
        if (queued.current) {
          queued.current = false;
          saveRef.current({ silent: true });
        }
      });
      return inFlight.current;
    },
    [actions, catalogId, queryClient, toast],
  );
  saveRef.current = save;

  const setAutosave = (value) => {
    setAutosaveState(value);
    try {
      localStorage.setItem(AUTOSAVE_KEY, value ? 'on' : 'off');
    } catch {
      /* preferencia no persistida */
    }
  };

  const dirty = selectIsDirty(state);

  // Autosave: espera a que el usuario deje de editar.
  useEffect(() => {
    if (!autosave || !dirty || status.conflict || !state.catalog) return undefined;
    const timer = setTimeout(() => save({ silent: true }), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [autosave, dirty, state.changeId, status.conflict, state.catalog, save]);

  // Aviso del navegador si se intenta cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return { save, status, dirty, autosave, setAutosave };
}
