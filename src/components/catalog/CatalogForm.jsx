import { useMemo, useState } from 'react';
import { Link2, Link2Off, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Card } from '../ui/Controls.jsx';
import { SegmentedControl } from '../ui/Controls.jsx';
import { ColorPicker } from '../ui/ColorPicker.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Input, Textarea } from '../ui/Input.jsx';
import { NumberInput } from '../ui/NumberInput.jsx';
import { cn } from '../../utils/cn.js';
import { PageSizePreview } from './PageSizePreview.jsx';
import { computePageSize, toFormValues, validateCatalog } from './catalogFormUtils.js';
import './CatalogForm.css';

const MARGINS = [
  ['marginTop', 'Superior'],
  ['marginBottom', 'Inferior'],
  ['marginLeft', 'Izquierdo'],
  ['marginRight', 'Derecho'],
];

const COLORS = [
  ['colorPrimary', 'Color principal', 'Títulos, bandas y acentos'],
  ['colorSecondary', 'Color secundario', 'Bloques y fondos alternos'],
  ['colorText', 'Color de texto', 'Texto general'],
  ['colorBackground', 'Color de fondo', 'Fondo de las páginas'],
];

/**
 * Formulario de configuración del documento (crear y editar).
 * Se usa en la pantalla de nuevo catálogo, en su configuración y dentro del editor.
 */
export function CatalogForm({ catalog, config, onSubmit, onCancel, submitLabel = 'Guardar', loading = false, serverErrors = {}, compact = false }) {
  const [values, setValues] = useState(() => toFormValues(catalog));
  const [errors, setErrors] = useState({});
  const [linkedMargins, setLinkedMargins] = useState(
    () => new Set(MARGINS.map(([key]) => values[key])).size === 1,
  );

  const formats = useMemo(() => config?.formats || [], [config]);
  const size = useMemo(() => computePageSize(values, formats), [values, formats]);
  const allErrors = { ...serverErrors, ...errors };

  const set = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setMargin = (field, value) => {
    if (!linkedMargins) return set(field, value);
    setValues((v) => ({ ...v, marginTop: value, marginBottom: value, marginLeft: value, marginRight: value }));
    setErrors((e) => ({ ...e, marginTop: undefined, marginBottom: undefined, marginLeft: undefined, marginRight: undefined }));
    return undefined;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateCatalog(values, formats, config?.customLimits);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      customWidth: values.format === 'PERSONALIZADO' ? Number(values.customWidth) : null,
      customHeight: values.format === 'PERSONALIZADO' ? Number(values.customHeight) : null,
    });
  };

  return (
    <form className={cn('catalog-form', compact && 'catalog-form--compact')} onSubmit={handleSubmit} noValidate>
      <div className="catalog-form__main">
        <Card title="Información">
          <div className="stack">
            <FormField label="Nombre del catálogo" required error={allErrors.name}>
              <Input value={values.name} maxLength={120} placeholder="Ej. Catálogo Primavera 2026" onChange={(e) => set('name', e.target.value)} autoFocus={!catalog} />
            </FormField>
            <FormField label="Descripción" hint="Opcional. Solo es visible en el panel.">
              <Textarea value={values.description || ''} maxLength={1000} rows={2} onChange={(e) => set('description', e.target.value)} />
            </FormField>
          </div>
        </Card>

        <Card title="Formato de página" description="Tamaño físico de cada hoja del PDF.">
          <div className="stack">
            <div className="format-grid" role="radiogroup" aria-label="Formato de página">
              {formats.map((format) => (
                <button
                  key={format.key}
                  type="button"
                  role="radio"
                  aria-checked={values.format === format.key}
                  className={cn('format-option', values.format === format.key && 'is-selected')}
                  onClick={() => set('format', format.key)}
                >
                  <span
                    className="format-option__shape"
                    style={format.width ? { aspectRatio: `${format.width} / ${format.height}` } : undefined}
                  />
                  <span className="format-option__text">
                    <strong>{format.label}</strong>
                    <small>{format.description}</small>
                  </span>
                </button>
              ))}
            </div>

            {values.format === 'PERSONALIZADO' && (
              <div className="form-grid form-grid--2">
                <FormField label="Ancho" error={allErrors.customWidth}>
                  <NumberInput size="md" value={values.customWidth} suffix="mm" min={0} onChange={(v) => set('customWidth', v)} />
                </FormField>
                <FormField label="Alto" error={allErrors.customHeight}>
                  <NumberInput size="md" value={values.customHeight} suffix="mm" min={0} onChange={(v) => set('customHeight', v)} />
                </FormField>
              </div>
            )}

            <FormField label="Orientación">
              <SegmentedControl
                size="md"
                value={values.orientation}
                onChange={(v) => set('orientation', v)}
                ariaLabel="Orientación"
                options={[
                  { value: 'PORTRAIT', label: 'Vertical', icon: RectangleVertical },
                  { value: 'LANDSCAPE', label: 'Horizontal', icon: RectangleHorizontal },
                ]}
              />
            </FormField>
          </div>
        </Card>

        <Card
          title="Márgenes"
          description="Área segura de impresión en milímetros. Se muestran como guías en el editor."
          actions={
            <Button
              size="sm"
              variant={linkedMargins ? 'subtle' : 'ghost'}
              icon={linkedMargins ? Link2 : Link2Off}
              onClick={() => setLinkedMargins((v) => !v)}
              tooltip={linkedMargins ? 'Editar cada margen por separado' : 'Usar el mismo valor en los cuatro márgenes'}
              tooltipPosition="top"
            >
              {linkedMargins ? 'Iguales' : 'Independientes'}
            </Button>
          }
        >
          <div className="form-grid form-grid--4">
            {MARGINS.map(([key, label]) => (
              <FormField key={key} label={label} error={allErrors[key]}>
                <NumberInput size="md" value={values[key]} suffix="mm" min={0} max={100} step={1} onChange={(v) => setMargin(key, v)} />
              </FormField>
            ))}
          </div>
        </Card>

        <Card title="Colores" description="Los elementos pueden usar estos colores; al cambiarlos se actualiza todo el catálogo.">
          <div className="form-grid form-grid--2">
            {COLORS.map(([key, label, hint]) => (
              <FormField key={key} label={label} hint={hint} error={allErrors[key]}>
                <ColorPicker value={values[key]} onChange={(v) => v && set(key, v)} />
              </FormField>
            ))}
          </div>
        </Card>
      </div>

      <aside className="catalog-form__aside">
        <div className="catalog-form__preview">
          <h3>Vista de la hoja</h3>
          <PageSizePreview width={size.width} height={size.height} margins={values} colors={values} />
        </div>
        <div className="catalog-form__actions">
          <Button type="submit" variant="primary" loading={loading} block>
            {submitLabel}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={loading} block>
              Cancelar
            </Button>
          )}
        </div>
      </aside>
    </form>
  );
}
