/** Valores por defecto de un catálogo nuevo. */
export const DEFAULT_CATALOG = {
  name: '',
  description: '',
  format: 'NORMAL',
  orientation: 'PORTRAIT',
  customWidth: 200,
  customHeight: 280,
  marginTop: 15,
  marginBottom: 15,
  marginLeft: 15,
  marginRight: 15,
  colorPrimary: '#F64851',
  colorSecondary: '#1F2937',
  colorText: '#111827',
  colorBackground: '#FFFFFF',
};

export const CATALOG_FIELDS = Object.keys(DEFAULT_CATALOG);

/** Extrae del catálogo solo los campos del formulario. */
export function toFormValues(catalog) {
  const values = { ...DEFAULT_CATALOG };
  for (const key of CATALOG_FIELDS) {
    if (catalog?.[key] !== undefined && catalog?.[key] !== null) values[key] = catalog[key];
  }
  return values;
}

/** Dimensiones en mm según formato y orientación (formats: lista de /api/config). */
export function computePageSize(values, formats = []) {
  const def = formats.find((f) => f.key === values.format);
  let width = def?.width ?? (Number(values.customWidth) || 210);
  let height = def?.height ?? (Number(values.customHeight) || 297);
  if (values.orientation === 'LANDSCAPE') [width, height] = [height, width];
  return { width, height };
}

/** Validación en cliente (el backend vuelve a validar todo). */
export function validateCatalog(values, formats, limits = { min: 50, max: 1200 }) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio';
  if (values.format === 'PERSONALIZADO') {
    for (const key of ['customWidth', 'customHeight']) {
      const n = Number(values[key]);
      if (!n || n < limits.min || n > limits.max) errors[key] = `Entre ${limits.min} y ${limits.max} mm`;
    }
  }
  for (const key of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight']) {
    const n = Number(values[key]);
    if (!Number.isFinite(n) || n < 0 || n > 100) errors[key] = 'Entre 0 y 100 mm';
  }
  const { width, height } = computePageSize(values, formats);
  if (!errors.marginLeft && Number(values.marginLeft) + Number(values.marginRight) > width - 20) {
    errors.marginLeft = 'Los márgenes laterales dejan muy poco espacio';
  }
  if (!errors.marginTop && Number(values.marginTop) + Number(values.marginBottom) > height - 20) {
    errors.marginTop = 'Los márgenes superior e inferior dejan muy poco espacio';
  }
  return errors;
}
