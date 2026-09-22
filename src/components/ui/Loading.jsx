import './Loading.css';

export function Spinner({ size = 18, className = '' }) {
  return (
    <span
      className={`spinner ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando"
    />
  );
}

/** Estado de carga para secciones o páginas completas. */
export function Loading({ label = 'Cargando…', fullscreen = false }) {
  return (
    <div className={fullscreen ? 'loading loading--fullscreen' : 'loading'}>
      <Spinner size={28} />
      {label && <p>{label}</p>}
    </div>
  );
}
