import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import './AdminLayout.css';

/** Estructura del panel: menú lateral + contenido. */
export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="admin__main">
        <header className="admin__mobile-header">
          <Button variant="ghost" icon={Menu} tooltip="Abrir menú" tooltipPosition="right" onClick={() => setMenuOpen(true)} />
          <Logo />
        </header>
        <main className="admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
