import { useEffect, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  FoldVertical,
  Italic,
} from 'lucide-react';
import { measureTextHeight } from '../../utils/measure.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ColorPicker } from '../../../components/ui/ColorPicker.jsx';
import { SegmentedControl } from '../../../components/ui/Controls.jsx';
import { Select, Textarea } from '../../../components/ui/Input.jsx';
import { NumberInput } from '../../../components/ui/NumberInput.jsx';
import { FONTS, fontWeights } from '../../../shared/renderModel.js';
import { PropField, PropGrid, PropRow, PropSection } from './PropSection.jsx';

const WEIGHT_NAMES = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extrabold' };

/** Contenido del texto (también editable con doble clic sobre la hoja). */
export function ContentSection({ element, update }) {
  const [value, setValue] = useState(element.content || '');
  useEffect(() => setValue(element.content || ''), [element.id, element.content]);

  return (
    <PropSection title="Contenido">
      <Textarea
        rows={4}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          update({ content: e.target.value }, 'content');
        }}
        placeholder="Escribe el texto…"
        aria-label="Contenido del texto"
      />
      <Button
        size="sm"
        variant="ghost"
        icon={FoldVertical}
        onClick={() => {
          const height = measureTextHeight(element.id);
          if (height) update({ height: Math.ceil(height * 10) / 10 + 0.5 });
        }}
      >
        Ajustar alto al texto
      </Button>
      <p className="prop-hint">Consejo: haz doble clic sobre el texto en la hoja para editarlo ahí mismo.</p>
    </PropSection>
  );
}

export function TypographySection({ element, catalog, update }) {
  const weights = fontWeights(element.fontFamily);
  const changeFamily = (fontFamily) => {
    const available = fontWeights(fontFamily);
    const fontWeight = available.includes(element.fontWeight)
      ? element.fontWeight
      : available.reduce((best, w) => (Math.abs(w - element.fontWeight) < Math.abs(best - element.fontWeight) ? w : best));
    update({ fontFamily, fontWeight });
  };

  return (
    <PropSection title="Tipografía">
      <PropRow label="Fuente" full>
        <Select
          size="sm"
          value={element.fontFamily || 'Inter'}
          onChange={(e) => changeFamily(e.target.value)}
          options={FONTS.map((f) => ({ value: f.family, label: f.family }))}
          aria-label="Fuente"
          style={{ fontFamily: element.fontFamily }}
        />
      </PropRow>
      <PropGrid>
        <PropField label="Tamaño">
          <NumberInput value={element.fontSize ?? 12} suffix="pt" min={1} max={500} step={1} decimals={1} onChange={(fontSize) => update({ fontSize })} />
        </PropField>
        <PropField label="Peso">
          <Select
            size="sm"
            value={element.fontWeight ?? 400}
            onChange={(e) => update({ fontWeight: Number(e.target.value) })}
            options={weights.map((w) => ({ value: w, label: `${w} · ${WEIGHT_NAMES[w]}` }))}
            aria-label="Peso de la fuente"
          />
        </PropField>
        <PropField label="Interlineado">
          <NumberInput value={element.lineHeight ?? 1.25} min={0.5} max={5} step={0.05} onChange={(lineHeight) => update({ lineHeight })} />
        </PropField>
        <PropField label="Espaciado">
          <NumberInput value={element.letterSpacing ?? 0} suffix="pt" min={-10} max={50} step={0.1} decimals={1} onChange={(letterSpacing) => update({ letterSpacing })} />
        </PropField>
      </PropGrid>

      <PropRow label="Color">
        <ColorPicker value={element.color || 'text'} catalog={catalog} onChange={(color) => update({ color: color || 'text' }, 'color')} />
      </PropRow>

      <PropRow label="Alineación">
        <div className="row">
          <SegmentedControl
            value={element.textAlign || 'left'}
            onChange={(textAlign) => update({ textAlign })}
            ariaLabel="Alineación horizontal"
            options={[
              { value: 'left', icon: AlignLeft, tooltip: 'Izquierda' },
              { value: 'center', icon: AlignCenter, tooltip: 'Centro' },
              { value: 'right', icon: AlignRight, tooltip: 'Derecha' },
              { value: 'justify', icon: AlignJustify, tooltip: 'Justificado' },
            ]}
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Italic}
            active={element.fontStyle === 'italic'}
            tooltip="Cursiva"
            tooltipPosition="top"
            onClick={() => update({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
          />
        </div>
      </PropRow>
      <PropRow label="Vertical">
        <SegmentedControl
          value={element.verticalAlign || 'top'}
          onChange={(verticalAlign) => update({ verticalAlign })}
          ariaLabel="Alineación vertical"
          options={[
            { value: 'top', icon: AlignVerticalJustifyStart, tooltip: 'Arriba' },
            { value: 'middle', icon: AlignVerticalJustifyCenter, tooltip: 'Centro' },
            { value: 'bottom', icon: AlignVerticalJustifyEnd, tooltip: 'Abajo' },
          ]}
        />
      </PropRow>
    </PropSection>
  );
}
