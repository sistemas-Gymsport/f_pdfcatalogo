import { useEffect, useRef } from 'react';
import { useEditorActions, useEditorUi } from '../state/EditorContext.jsx';

const isTyping = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Atajos de teclado del editor. Se ignoran mientras se escribe o hay un modal abierto. */
export function useEditorShortcuts({ onSave }) {
  const actions = useEditorActions();
  const ui = useEditorUi();
  const uiRef = useRef(ui);
  uiRef.current = ui;
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  useEffect(() => {
    const onKeyDown = (event) => {
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      // Guardar funciona incluso dentro de un campo (primero confirma el valor del campo).
      if (mod && key === 's') {
        event.preventDefault();
        if (isTyping(document.activeElement)) document.activeElement.blur();
        setTimeout(() => saveRef.current(), 50);
        return;
      }

      if (isTyping(event.target) || document.querySelector('.modal-backdrop')) return;

      if (mod && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        actions.undo();
      } else if (mod && (key === 'y' || (key === 'z' && event.shiftKey))) {
        event.preventDefault();
        actions.redo();
      } else if (mod && key === 'c') {
        actions.copySelected();
      } else if (mod && key === 'v') {
        event.preventDefault();
        actions.paste();
      } else if (mod && key === 'd') {
        event.preventDefault();
        actions.duplicateSelected();
      } else if (key === 'delete' || key === 'backspace') {
        event.preventDefault();
        actions.deleteSelected();
      } else if (key === 'escape') {
        actions.clearSelection();
      } else if (key.startsWith('arrow')) {
        event.preventDefault();
        const step = event.shiftKey ? 5 : 1;
        const delta = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] }[key];
        actions.nudge(...delta);
      } else if (mod && (key === '=' || key === '+')) {
        event.preventDefault();
        uiRef.current.setZoom(uiRef.current.zoom * 1.1);
      } else if (mod && key === '-') {
        event.preventDefault();
        uiRef.current.setZoom(uiRef.current.zoom / 1.1);
      } else if (mod && key === '0') {
        event.preventDefault();
        uiRef.current.requestFit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions]);
}
