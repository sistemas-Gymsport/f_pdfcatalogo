import { memo } from 'react';
import {
  catalogCssVars,
  cleanStyle,
  elementFrameStyle,
  pageStyle,
  PX_PER_MM,
  sortElements,
} from '../../shared/renderModel.js';
import { thumbnailUrl } from '../../utils/cloudinary.js';
import { ElementContent } from './ElementContent.jsx';
import './StaticPage.css';

/**
 * Página de solo lectura escalada a un ancho en px (miniaturas y tarjetas).
 * Se dibuja a tamaño real en mm y se reduce con transform: scale().
 */
export const StaticPage = memo(function StaticPage({ page, catalog, width = 160 }) {
  const size = { width: catalog.pageWidth, height: catalog.pageHeight };
  const scale = width / (size.width * PX_PER_MM);
  const height = size.height * PX_PER_MM * scale;
  const elements = sortElements(page?.elements).filter((el) => !el.hidden);

  return (
    <div className="static-page" style={{ width, height }}>
      <div
        className="static-page__sheet"
        style={{ ...cleanStyle(pageStyle(page || {}, size)), ...catalogCssVars(catalog), transform: `scale(${scale})` }}
      >
        {elements.map((el) => (
          <div key={el.id} style={cleanStyle(elementFrameStyle(el))}>
            <ElementContent element={el} imageVariant={thumbnailUrl} />
          </div>
        ))}
      </div>
    </div>
  );
});
