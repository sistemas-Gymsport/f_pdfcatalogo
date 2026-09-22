import './PageSizePreview.css';

/**
 * Vista esquemática de la hoja: proporción real, márgenes y colores.
 * Todas las medidas se expresan como porcentaje de la página.
 */
export function PageSizePreview({ width, height, margins, colors, maxWidth = 220, maxHeight = 300 }) {
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const pct = (value, total) => `${(value / total) * 100}%`;

  return (
    <div className="size-preview">
      <div
        className="size-preview__sheet"
        style={{ width: width * scale, height: height * scale, background: colors.colorBackground }}
      >
        <div
          className="size-preview__margins"
          style={{
            top: pct(margins.marginTop, height),
            bottom: pct(margins.marginBottom, height),
            left: pct(margins.marginLeft, width),
            right: pct(margins.marginRight, width),
          }}
        >
          <span className="size-preview__title" style={{ background: colors.colorPrimary }} />
          <span className="size-preview__photo" style={{ background: colors.colorSecondary }} />
          <span className="size-preview__line" style={{ background: colors.colorText }} />
          <span className="size-preview__line size-preview__line--short" style={{ background: colors.colorText }} />
        </div>
      </div>
      <p className="size-preview__caption">
        {Math.round(width * 10) / 10} × {Math.round(height * 10) / 10} mm
      </p>
    </div>
  );
}
