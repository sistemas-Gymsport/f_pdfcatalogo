import { AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, Maximize, MoveHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { NumberInput } from '../../../components/ui/NumberInput.jsx';
import { contentArea, round2 } from '../../utils/geometry.js';
import { PropField, PropGrid, PropSection } from './PropSection.jsx';

/** Posición, tamaño y rotación en mm, con atajos de alineación en la página. */
export function PositionSection({ element, catalog, update }) {
  const area = contentArea(catalog);
  const W = catalog.pageWidth;
  const H = catalog.pageHeight;

  return (
    <PropSection title="Posición y tamaño">
      <PropGrid>
        <PropField label="X">
          <NumberInput value={element.x} suffix="mm" step={1} onChange={(x) => update({ x })} />
        </PropField>
        <PropField label="Y">
          <NumberInput value={element.y} suffix="mm" step={1} onChange={(y) => update({ y })} />
        </PropField>
        <PropField label="Ancho">
          <NumberInput value={element.width} suffix="mm" min={1} step={1} onChange={(width) => update({ width })} />
        </PropField>
        <PropField label="Alto">
          <NumberInput value={element.height} suffix="mm" min={1} step={1} onChange={(height) => update({ height })} />
        </PropField>
        <PropField label="Rotación">
          <NumberInput value={element.rotation || 0} suffix="°" min={-360} max={360} step={1} decimals={1} onChange={(rotation) => update({ rotation })} />
        </PropField>
      </PropGrid>
      <div className="prop-actions">
        <Button size="sm" variant="ghost" icon={AlignHorizontalJustifyCenter} tooltip="Centrar horizontalmente en la página" tooltipPosition="top" onClick={() => update({ x: round2((W - element.width) / 2) })} />
        <Button size="sm" variant="ghost" icon={AlignVerticalJustifyCenter} tooltip="Centrar verticalmente en la página" tooltipPosition="top" onClick={() => update({ y: round2((H - element.height) / 2) })} />
        <Button size="sm" variant="ghost" icon={MoveHorizontal} tooltip="Ajustar al ancho de los márgenes" tooltipPosition="top" onClick={() => update({ x: area.x, width: round2(area.width) })} />
        <Button size="sm" variant="ghost" icon={Maximize} tooltip="Página completa (a sangre)" tooltipPosition="top" onClick={() => update({ x: 0, y: 0, width: W, height: H })} />
      </div>
    </PropSection>
  );
}
