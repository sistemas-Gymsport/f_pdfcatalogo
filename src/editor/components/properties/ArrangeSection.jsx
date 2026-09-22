import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, Copy, Eye, EyeOff, Lock, Trash2, Unlock } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { useEditorActions } from '../../state/EditorContext.jsx';
import { PropRow, PropSection } from './PropSection.jsx';

/** Orden de capas, bloqueo, visibilidad, duplicar y eliminar. */
export function ArrangeSection({ element, update }) {
  const actions = useEditorActions();
  const reorder = (direction) => actions.reorder(element.id, direction);

  return (
    <PropSection title="Organizar">
      <PropRow label="Capa">
        <div className="prop-actions">
          <Button size="sm" variant="ghost" icon={ArrowUpToLine} tooltip="Traer al frente" tooltipPosition="top" onClick={() => reorder('front')} />
          <Button size="sm" variant="ghost" icon={ArrowUp} tooltip="Traer adelante" tooltipPosition="top" onClick={() => reorder('forward')} />
          <Button size="sm" variant="ghost" icon={ArrowDown} tooltip="Enviar atrás" tooltipPosition="top" onClick={() => reorder('backward')} />
          <Button size="sm" variant="ghost" icon={ArrowDownToLine} tooltip="Enviar al fondo" tooltipPosition="top" onClick={() => reorder('back')} />
        </div>
      </PropRow>
      <div className="prop-actions prop-actions--wrap">
        <Button size="sm" icon={element.locked ? Unlock : Lock} active={element.locked} onClick={() => update({ locked: !element.locked })}>
          {element.locked ? 'Desbloquear' : 'Bloquear'}
        </Button>
        <Button size="sm" icon={element.hidden ? Eye : EyeOff} active={element.hidden} onClick={() => update({ hidden: !element.hidden })}>
          {element.hidden ? 'Mostrar' : 'Ocultar'}
        </Button>
        <Button size="sm" icon={Copy} onClick={actions.duplicateSelected}>
          Duplicar
        </Button>
        <Button size="sm" icon={Trash2} className="prop-delete" onClick={() => actions.deleteElement(element.id)}>
          Eliminar
        </Button>
      </div>
      {element.hidden && <p className="prop-hint">Los elementos ocultos no aparecen en la vista previa ni en el PDF.</p>}
    </PropSection>
  );
}
