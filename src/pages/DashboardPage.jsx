import { Link } from 'react-router-dom';
import { BookOpen, FileStack, Images, Layers, Plus, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalogs, useStats } from '../hooks/useCatalogs.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Controls.jsx';
import { EmptyState, ErrorState } from '../components/ui/EmptyState.jsx';
import { Loading } from '../components/ui/Loading.jsx';
import { StaticPage } from '../components/pdf/StaticPage.jsx';
import { formatRelative, pluralize } from '../utils/format.js';
import './DashboardPage.css';

const STATS = [
  { key: 'catalogs', label: 'Catálogos', icon: BookOpen },
  { key: 'pages', label: 'Páginas', icon: FileStack },
  { key: 'elements', label: 'Elementos', icon: Layers },
  { key: 'images', label: 'Imágenes', icon: Images },
];

const STEPS = [
  ['Crea un catálogo', 'Elige formato, márgenes y colores.'],
  ['Sube tus imágenes', 'Se guardan en Cloudinary.'],
  ['Diseña cada página', 'Agrega títulos, textos, imágenes y bloques.'],
  ['Genera el PDF', 'Listo para descargar e imprimir.'],
];

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = useStats();
  const catalogs = useCatalogs();
  const recent = (catalogs.data || []).slice(0, 4);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Hola, ${user?.email}. Este es el resumen de tu trabajo.`}
        actions={
          <>
            <Button icon={Upload} to="/admin/imagenes">
              Subir imágenes
            </Button>
            <Button variant="primary" icon={Plus} to="/admin/catalogos/nuevo">
              Nuevo catálogo
            </Button>
          </>
        }
      />

      <div className="stats-grid">
        {STATS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="stat">
            <span className="stat__icon">
              <Icon size={20} />
            </span>
            <div>
              <p className="stat__value">{stats.isLoading ? '—' : stats.data?.[key] ?? 0}</p>
              <p className="stat__label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card title="Catálogos recientes" actions={<Button size="sm" variant="ghost" to="/admin/catalogos">Ver todos</Button>}>
          {catalogs.isLoading ? (
            <Loading />
          ) : catalogs.isError ? (
            <ErrorState error={catalogs.error} onRetry={catalogs.refetch} />
          ) : recent.length === 0 ? (
            <EmptyState
              compact
              icon={BookOpen}
              title="Todavía no tienes catálogos"
              description="Crea el primero para empezar a diseñar."
              action={<Button variant="primary" icon={Plus} to="/admin/catalogos/nuevo">Nuevo catálogo</Button>}
            />
          ) : (
            <ul className="recent-list">
              {recent.map((catalog) => (
                <li key={catalog.id}>
                  <Link to={`/admin/catalogos/${catalog.id}`} className="recent-item" aria-label={`Abrir ${catalog.name}`}>
                    {catalog.coverPage && <StaticPage page={catalog.coverPage} catalog={catalog} width={44} />}
                  </Link>
                  <div className="recent-item__text">
                    <strong>{catalog.name}</strong>
                    <small>
                      {pluralize(catalog.pageCount, 'página')} · editado {formatRelative(catalog.updatedAt)}
                    </small>
                  </div>
                  <Button size="sm" to={`/admin/catalogos/${catalog.id}`}>
                    Abrir
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Cómo funciona">
          <ol className="steps">
            {STEPS.map(([title, text], index) => (
              <li key={title}>
                <span className="steps__number">{index + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <p className="text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
