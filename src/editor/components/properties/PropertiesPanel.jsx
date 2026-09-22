import { useCallback } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { getElementMeta } from '../../elementRegistry.js';
import { useEditorActions, useEditorState } from '../../state/EditorContext.jsx';
import { selectCurrentPage, selectSelectedElements } from '../../state/editorReducer.js';
import { ArrangeSection } from './ArrangeSection.jsx';
import { LayersSection } from './LayersSection.jsx';
import { PageProperties } from './PageProperties.jsx';
import { PositionSection } from './PositionSection.jsx';
import { AppearanceSection, ImageSection, LineSection } from './StyleSections.jsx';
import { ContentSection, TypographySection } from './TextSections.jsx';
import './PropertiesPanel.css';

/** Secciones disponibles. El registro de elementos decide cuáles mostrar y en qué orden. */
const SECTIONS = {
  content: ContentSection,
  typography: TypographySection,
  image: ImageSection,
  line: LineSection,
  position: PositionSection,
  appearance: AppearanceSection,
  arrange: ArrangeSection,
};

export function PropertiesPanel({ onPickImage, onOpenSettings }) {
  const state = useEditorState();
  const actions = useEditorActions();
  const selected = selectSelectedElements(state);
  const page = selectCurrentPage(state);
  const element = selected.length === 1 ? selected[0] : null;
  const elementId = element?.id;

  const update = useCallback(
    (changes, coalesceKey) => actions.updateElement(elementId, changes, coalesceKey ? `${elementId}:${coalesceKey}` : undefined),
    [actions, elementId],
  );

  if (!page) return null;

  let body;
  if (selected.length > 1) {
    body = (
      <div className="props-multi">
        <p>
          <strong>{selected.length} elementos</strong> seleccionados.
        </p>
        <div className="prop-actions">
          <Button size="sm" icon={Copy} onClick={actions.duplicateSelected}>
            Duplicar
          </Button>
          <Button size="sm" icon={Trash2} className="prop-delete" onClick={actions.deleteSelected}>
            Eliminar
          </Button>
        </div>
      </div>
    );
  } else if (element) {
    const meta = getElementMeta(element.type);
    const Icon = meta.icon;
    body = (
      <>
        <header className="props-header">
          <span className="props-header__icon">
            <Icon size={16} />
          </span>
          <div>
            <strong>{meta.label}</strong>
            <small>Elemento seleccionado</small>
          </div>
        </header>
        {meta.sections.map((key) => {
          const Section = SECTIONS[key];
          return (
            <Section
              key={`${element.id}:${key}`}
              element={element}
              catalog={state.catalog}
              update={update}
              onPickImage={onPickImage}
            />
          );
        })}
      </>
    );
  } else {
    body = (
      <PageProperties
        page={page}
        pageIndex={state.pages.findIndex((p) => p.id === page.id)}
        catalog={state.catalog}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  return (
    <aside className="props" aria-label="Propiedades">
      <h2 className="props__title">Propiedades</h2>
      <div className="props__body">
        {body}
        <LayersSection page={page} selectedIds={state.selectedIds} />
      </div>
    </aside>
  );
}
