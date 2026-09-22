import { FileText } from 'lucide-react';
import './Logo.css';

/**
 * Identificador de la aplicación: ícono genérico de documento + nombre.
 * No es un logotipo de marca; se reemplaza aquí cuando exista el logo oficial.
 * Usa el color de referencia del proyecto (--accent: #F64851).
 */
export function Logo({ compact = false }) {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        <FileText size={18} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="logo__text">
          pdf<strong>catalogo</strong>
        </span>
      )}
    </span>
  );
}
