import { memo } from 'react';
import { ImageIcon } from 'lucide-react';
import { cleanStyle, elementContentStyles } from '../../shared/renderModel.js';
import { editorImageUrl } from '../../utils/cloudinary.js';
import './ElementContent.css';

/**
 * Contenido visual de un elemento. Produce la MISMA estructura y estilos
 * que el renderer del backend (backend/src/renderer), por eso lo que se ve
 * en el editor coincide con el PDF.
 *
 * - imageVariant: función que transforma la URL (miniaturas/editor).
 * - showPlaceholder: muestra un marcador cuando la imagen no está elegida.
 * - textSlot: reemplaza el texto (p. ej. un <textarea> para edición en línea).
 */
export const ElementContent = memo(function ElementContent({
  element,
  imageVariant = editorImageUrl,
  showPlaceholder = false,
  textSlot,
}) {
  const { kind, content, inner } = elementContentStyles(element);
  const contentStyle = cleanStyle(content);
  const innerStyle = cleanStyle(inner);

  if (kind === 'text') {
    return (
      <div className="el-content" style={contentStyle}>
        {textSlot || (
          <div className="el-text" style={innerStyle}>
            {element.content}
          </div>
        )}
      </div>
    );
  }

  if (kind === 'image') {
    const url = element.image?.url;
    return (
      <div className="el-content" style={contentStyle}>
        {url ? (
          <img src={imageVariant(url)} alt={element.image?.name || ''} style={innerStyle} draggable={false} />
        ) : (
          showPlaceholder && (
            <div className="el-image-placeholder">
              <ImageIcon size={22} aria-hidden="true" />
              <span>Selecciona una imagen</span>
            </div>
          )
        )}
      </div>
    );
  }

  if (kind === 'line') {
    return (
      <div className="el-content" style={contentStyle}>
        <div style={innerStyle} />
      </div>
    );
  }

  return <div className="el-content" style={contentStyle} />;
});
