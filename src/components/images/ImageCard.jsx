import { Check, Pencil, Trash2 } from 'lucide-react';
import { thumbnailUrl } from '../../utils/cloudinary.js';
import { cn } from '../../utils/cn.js';
import { Button } from '../ui/Button.jsx';
import './ImageCard.css';

/** Miniatura de imagen. En modo selección todo el recuadro es clicable. */
export function ImageCard({ image, selectable = false, selected = false, onSelect, onEdit, onDelete }) {
  const Wrapper = selectable ? 'button' : 'div';
  return (
    <article className={cn('image-card', selectable && 'image-card--selectable', selected && 'is-selected')}>
      <Wrapper
        className="image-card__thumb"
        {...(selectable ? { type: 'button', onClick: () => onSelect(image), 'aria-pressed': selected, 'aria-label': `Seleccionar ${image.name}` } : {})}
      >
        <img src={thumbnailUrl(image.url)} alt={image.description || image.name} loading="lazy" />
        {selected && (
          <span className="image-card__check">
            <Check size={16} />
          </span>
        )}
      </Wrapper>
      <div className="image-card__info">
        <div className="image-card__text">
          <strong title={image.name}>{image.name}</strong>
          <small>
            {image.width} × {image.height} px{image.usageCount ? ` · en uso (${image.usageCount})` : ''}
          </small>
        </div>
        {(onEdit || onDelete) && (
          <div className="image-card__actions">
            {onEdit && <Button size="sm" variant="ghost" icon={Pencil} tooltip="Editar información" tooltipPosition="top" onClick={() => onEdit(image)} />}
            {onDelete && <Button size="sm" variant="ghost" icon={Trash2} tooltip="Eliminar" tooltipPosition="top" onClick={() => onDelete(image)} />}
          </div>
        )}
      </div>
    </article>
  );
}
