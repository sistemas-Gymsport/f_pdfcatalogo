import { Link } from 'react-router-dom';
import { Copy, Eye, FileText, PenLine, Settings2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Controls.jsx';
import { StaticPage } from '../pdf/StaticPage.jsx';
import { formatRelative, pluralize } from '../../utils/format.js';
import './CatalogCard.css';

const FORMAT_LABELS = { NORMAL: 'Normal', ESTRECHO: 'Estrecho', A4: 'A4', CARTA: 'Carta', OFICIO: 'Oficio', PERSONALIZADO: 'Personalizado' };

export function CatalogCard({ catalog, onDuplicate, onDelete, duplicating }) {
  const editorUrl = `/admin/catalogos/${catalog.id}`;

  return (
    <article className="catalog-card">
      <Link to={editorUrl} className="catalog-card__cover" aria-label={`Abrir ${catalog.name} en el editor`}>
        {catalog.coverPage ? (
          <StaticPage page={catalog.coverPage} catalog={catalog} width={catalog.pageWidth > catalog.pageHeight ? 200 : 132} />
        ) : (
          <FileText size={32} />
        )}
        <span className="catalog-card__open">
          <PenLine size={16} /> Abrir editor
        </span>
      </Link>

      <div className="catalog-card__body">
        <div className="catalog-card__title-row">
          <h3 className="catalog-card__title" title={catalog.name}>
            <Link to={editorUrl}>{catalog.name}</Link>
          </h3>
          <span className="catalog-card__colors" aria-hidden="true">
            {['colorPrimary', 'colorSecondary', 'colorText'].map((field) => (
              <span key={field} style={{ background: catalog[field] }} />
            ))}
          </span>
        </div>
        <div className="catalog-card__meta">
          <Badge>{FORMAT_LABELS[catalog.format] || catalog.format}</Badge>
          <Badge>{catalog.orientation === 'LANDSCAPE' ? 'Horizontal' : 'Vertical'}</Badge>
          <span className="text-muted">{pluralize(catalog.pageCount ?? 0, 'página')}</span>
        </div>
        <p className="catalog-card__date">Editado {formatRelative(catalog.updatedAt)}</p>
      </div>

      <footer className="catalog-card__actions">
        <Button size="sm" variant="primary" icon={PenLine} to={editorUrl}>
          Editar
        </Button>
        <Button size="sm" variant="ghost" icon={Eye} tooltip="Vista previa" tooltipPosition="top" to={`${editorUrl}/vista-previa`} />
        <Button size="sm" variant="ghost" icon={Settings2} tooltip="Configurar documento" tooltipPosition="top" to={`${editorUrl}/configuracion`} />
        <Button size="sm" variant="ghost" icon={Copy} tooltip="Duplicar" tooltipPosition="top" loading={duplicating} onClick={() => onDuplicate(catalog)} />
        <Button size="sm" variant="ghost" icon={Trash2} tooltip="Eliminar" tooltipPosition="top" className="catalog-card__delete" onClick={() => onDelete(catalog)} />
      </footer>
    </article>
  );
}
