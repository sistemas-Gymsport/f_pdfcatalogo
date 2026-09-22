import './PageHeader.css';

/** Encabezado de cada pantalla: título, descripción y acciones. */
export function PageHeader({ title, description, actions, children }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h1>{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
      {children}
    </div>
  );
}
