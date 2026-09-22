import { ImageIcon, RefreshCw, Ratio, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { ColorPicker } from '../../../components/ui/ColorPicker.jsx';
import { SegmentedControl } from '../../../components/ui/Controls.jsx';
import { Select } from '../../../components/ui/Input.jsx';
import { NumberInput } from '../../../components/ui/NumberInput.jsx';
import { TEXT_TYPES } from '../../../shared/renderModel.js';
import { thumbnailUrl } from '../../../utils/cloudinary.js';
import { round2 } from '../../utils/geometry.js';
import { PropField, PropGrid, PropRow, PropSection } from './PropSection.jsx';

const BORDER_STYLES = [
  { value: 'solid', label: 'Sólido' },
  { value: 'dashed', label: 'Discontinuo' },
  { value: 'dotted', label: 'Punteado' },
];

/** Fondo, borde, radio, relleno y opacidad. */
export function AppearanceSection({ element, catalog, update }) {
  const isText = TEXT_TYPES.includes(element.type);
  const isRect = element.type === 'rectangle';
  const opacity = Math.round((element.opacity ?? 1) * 100);

  return (
    <PropSection title="Apariencia">
      <PropRow label={isRect ? 'Color' : 'Fondo'}>
        <ColorPicker
          value={element.backgroundColor ?? (isRect ? 'primary' : null)}
          catalog={catalog}
          allowNone
          noneLabel="Sin fondo"
          onChange={(backgroundColor) => update({ backgroundColor: backgroundColor ?? (isRect ? 'transparent' : null) }, 'bg')}
        />
      </PropRow>

      <PropGrid>
        <PropField label="Borde">
          <NumberInput value={element.borderWidth ?? 0} suffix="mm" min={0} max={50} step={0.1} onChange={(borderWidth) => update({ borderWidth })} />
        </PropField>
        <PropField label="Estilo">
          <Select size="sm" value={element.borderStyle || 'solid'} options={BORDER_STYLES} onChange={(e) => update({ borderStyle: e.target.value })} aria-label="Estilo del borde" />
        </PropField>
        <PropField label="Radio">
          <NumberInput value={element.borderRadius ?? 0} suffix="mm" min={0} max={1000} step={0.5} onChange={(borderRadius) => update({ borderRadius })} />
        </PropField>
        {isText && (
          <PropField label="Relleno">
            <NumberInput value={element.padding ?? 0} suffix="mm" min={0} max={100} step={0.5} onChange={(padding) => update({ padding })} />
          </PropField>
        )}
      </PropGrid>

      {element.borderWidth > 0 && (
        <PropRow label="Color borde">
          <ColorPicker value={element.borderColor || 'text'} catalog={catalog} onChange={(borderColor) => update({ borderColor }, 'borderColor')} />
        </PropRow>
      )}

      <PropRow label="Opacidad">
        <div className="prop-range">
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => update({ opacity: Number(e.target.value) / 100 }, 'opacity')}
            aria-label="Opacidad"
          />
          <span>{opacity}%</span>
        </div>
      </PropRow>
    </PropSection>
  );
}

/** Imagen: cambiar/quitar, ajuste y proporción. */
export function ImageSection({ element, update, onPickImage }) {
  const image = element.image;
  const fixRatio = () => {
    if (!image?.width || !image?.height) return;
    update({ height: round2(element.width * (image.height / image.width)) });
  };

  return (
    <PropSection title="Imagen">
      <div className="prop-image">
        {image?.url ? (
          <img src={thumbnailUrl(image.url)} alt={image.name || ''} />
        ) : (
          <div className="prop-image__empty">
            <ImageIcon size={22} />
            <span>Sin imagen</span>
          </div>
        )}
      </div>
      {image?.name && <p className="prop-hint">{image.name}</p>}
      <div className="prop-actions">
        <Button size="sm" variant={image ? 'secondary' : 'primary'} icon={image ? RefreshCw : ImageIcon} onClick={onPickImage}>
          {image ? 'Cambiar imagen' : 'Elegir imagen'}
        </Button>
        {image && <Button size="sm" variant="ghost" icon={X} tooltip="Quitar imagen" tooltipPosition="top" onClick={() => update({ imageId: null, image: null })} />}
      </div>
      <PropRow label="Ajuste">
        <SegmentedControl
          value={element.objectFit || 'cover'}
          onChange={(objectFit) => update({ objectFit })}
          ariaLabel="Ajuste de la imagen"
          options={[
            { value: 'cover', label: 'Cubrir', tooltip: 'Llena el recuadro recortando los bordes' },
            { value: 'contain', label: 'Contener', tooltip: 'Muestra la imagen completa' },
            { value: 'fill', label: 'Estirar', tooltip: 'Deforma para llenar el recuadro' },
          ]}
        />
      </PropRow>
      {image?.width > 0 && (
        <Button size="sm" variant="ghost" icon={Ratio} onClick={fixRatio}>
          Usar proporción original
        </Button>
      )}
    </PropSection>
  );
}

/** Línea: color, grosor y estilo. */
export function LineSection({ element, catalog, update }) {
  return (
    <PropSection title="Línea">
      <PropRow label="Color">
        <ColorPicker value={element.color || 'text'} catalog={catalog} onChange={(color) => update({ color: color || 'text' }, 'color')} />
      </PropRow>
      <PropGrid>
        <PropField label="Grosor">
          <NumberInput value={element.borderWidth ?? 0.5} suffix="mm" min={0.1} max={50} step={0.1} onChange={(borderWidth) => update({ borderWidth })} />
        </PropField>
        <PropField label="Estilo">
          <Select size="sm" value={element.borderStyle || 'solid'} options={BORDER_STYLES} onChange={(e) => update({ borderStyle: e.target.value })} aria-label="Estilo de la línea" />
        </PropField>
      </PropGrid>
    </PropSection>
  );
}
