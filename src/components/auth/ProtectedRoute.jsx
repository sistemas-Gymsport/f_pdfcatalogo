import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loading } from '../ui/Loading.jsx';

/** Rutas /admin/*: exige sesión válida (verificada con el backend). */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <Loading fullscreen label="Verificando sesión…" />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/** /login: si ya hay sesión, redirige al panel. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'checking') return <Loading fullscreen label="Verificando sesión…" />;
  if (status === 'authenticated') return <Navigate to="/admin" replace />;
  return <Outlet />;
}
