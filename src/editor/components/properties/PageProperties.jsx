import { useEffect, useState } from 'react';
import { MousePointerClick, Settings2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { ColorPicker } from '../../../components/ui/ColorPicker.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { COLOR_TOKEN_LABELS, CATALOG_COLOR_FIELDS } from '../../../utils/colors.js';
import { formatNumber } from '../../../utils/format.js';
import { useEditorActions } from '../../state/EditorContext.jsx';
import { PropRow, PropSection } from './PropSection.jsx';

const SHORTCUTS = [
  ['Supr', 'Eliminar'],
  ['Ctrl + Z / Y', 'Deshacer / Rehacer'],
  ['Ctrl + C / V', 'Copiar / Pegar'],
  ['Ctrl + D', 'Duplicar'],
  ['Flechas', 'Mover 1 mm (Shift: 5 mm)'],
  ['Ctrl + S', 'Guardar'],
  ['Ctrl + rueda', 'Zoom'],
];

/** Propiedades de la página y del documento (cuando no hay nada seleccionado). */
export function PageProperties({ page, pageIndex, catalog, onOpenSettings }) {
  const actions = useEditorActions();
  const [name, setName] = useState(page.name || '');
  useEffect(() => setName(page.name || ''), [page.id, page.name]);

  return (
    <>
      <div className="props-empty">
        <MousePointerClick size={18} />
        <span>Selecciona un elemento de la hoja para editar sus propiedades.</span>
      </div>

      <PropSection title={`Página ${pageIndex + 1}`}>
        <PropRow label="Nombre" full>
          <Input
            size="sm"
            value={name}
            maxLength={80}
            placeholder="Ej. Portada (opcional)"
            onChange={(e) => {
              setName(e.target.value);
              actions.updatePage(page.id, { name: e.target.value || null }, `page-name:${page.id}`);
            }}
          />
        </PropRow>
        <PropRow label="Fondo">
          <ColorPicker
            value={page.backgroundColor}
            catalog={catalog}
            allowNone
            noneLabel="Fondo del catálogo"
            onChange={(backgroundColor) => actions.updatePage(page.id, { backgroundColor }, `page-bg:${page.id}`)}
          />
        </PropRow>
      </PropSection>

      <PropSection title="Documento">
        <dl className="doc-info">
          <dt>Tamaño</dt>
          <dd>
            {formatNumber(catalog.pageWidth, 1)} × {formatNumber(catalog.pageHeight, 1)} mm
          </dd>
          <dt>Márgenes</dt>
          <dd>
            {catalog.marginTop} / {catalog.marginRight} / {catalog.marginBottom} / {catalog.marginLeft} mm
          </dd>
          <dt>Colores</dt>
          <dd className="doc-info__colors">
            {Object.entries(CATALOG_COLOR_FIELDS).map(([token, field]) => (
              <span key={token} style={{ background: catalog[field] }} data-tooltip={COLOR_TOKEN_LABELS[token]} data-tooltip-pos="top" />
            ))}
          </dd>
        </dl>
        <Button size="sm" icon={Settings2} block onClick={onOpenSettings}>
          Configurar documento
        </Button>
      </PropSection>

      <PropSection title="Atajos de teclado" defaultOpen={false}>
        <dl className="shortcuts">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </PropSection>
    </>
  );
}
