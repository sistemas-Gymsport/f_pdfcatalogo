import { Plus } from 'lucide-react';
import { ADD_ORDER, ELEMENT_REGISTRY } from '../elementRegistry.js';
import { useEditorActions } from '../state/EditorContext.jsx';
import './SidePanels.css';

/** Botones didácticos para agregar elementos a la página actual. */
export function ElementsPanel({ onAddImage }) {
  const actions = useEditorActions();

  const add = (type) => (type === 'image' ? onAddImage() : actions.addElement(type));

  return (
    <section className="side-section" aria-labelledby="add-elements-title">
      <h2 id="add-elements-title" className="side-section__title">
        Agregar elementos
      </h2>
      <div className="add-list">
        {ADD_ORDER.map((type) => {
          const { icon: Icon, addLabel, description } = ELEMENT_REGISTRY[type];
          return (
            <button key={type} type="button" className="add-item" onClick={() => add(type)} title={description}>
              <span className="add-item__icon">
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="add-item__label">{addLabel}</span>
              <Plus size={14} className="add-item__plus" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
