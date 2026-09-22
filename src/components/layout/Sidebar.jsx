import { NavLink } from 'react-router-dom';
import { BookOpen, Images, LayoutDashboard, LogOut, Plus, Settings, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/catalogos', label: 'Catálogos', icon: BookOpen },
  { to: '/admin/imagenes', label: 'Imágenes', icon: Images },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      <aside className={cn('sidebar', open && 'is-open')}>
        <div className="sidebar__top">
          <Logo />
          <Button className="sidebar__close" variant="ghost" size="sm" icon={X} tooltip="Cerrar menú" onClick={onClose} />
        </div>

        <div className="sidebar__cta">
          <Button variant="primary" icon={Plus} block to="/admin/catalogos/nuevo" onClick={onClose}>
            Nuevo catálogo
          </Button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => cn('sidebar__link', isActive && 'is-active')}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="sidebar__avatar" aria-hidden="true">
              {user?.email?.[0]?.toUpperCase()}
            </span>
            <div className="sidebar__user-info">
              <span className="sidebar__email" title={user?.email}>
                {user?.email}
              </span>
              <span className="sidebar__role">Administrador</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={LogOut} tooltip="Cerrar sesión" tooltipPosition="top" onClick={logout} />
        </div>
      </aside>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
    </>
  );
}
