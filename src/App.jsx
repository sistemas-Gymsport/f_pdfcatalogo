import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute.jsx';
import { Loading } from './components/ui/Loading.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';

// Carga diferida: el editor y la vista previa solo se descargan cuando se usan.
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const CatalogsPage = lazy(() => import('./pages/CatalogsPage.jsx'));
const CatalogFormPage = lazy(() => import('./pages/CatalogFormPage.jsx'));
const CatalogEditorPage = lazy(() => import('./pages/CatalogEditorPage.jsx'));
const CatalogPreviewPage = lazy(() => import('./pages/CatalogPreviewPage.jsx'));
const ImagesPage = lazy(() => import('./pages/ImagesPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function SuspenseOutlet() {
  return (
    <Suspense fallback={<Loading fullscreen />}>
      <Outlet />
    </Suspense>
  );
}

function PageSuspense() {
  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <SuspenseOutlet />,
    children: [
      { path: '/', element: <Navigate to="/admin" replace /> },
      {
        element: <PublicOnlyRoute />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      {
        path: '/admin',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                element: <PageSuspense />,
                children: [
                  { index: true, element: <DashboardPage /> },
                  { path: 'catalogos', element: <CatalogsPage /> },
                  { path: 'catalogos/nuevo', element: <CatalogFormPage /> },
                  { path: 'catalogos/:id/configuracion', element: <CatalogFormPage /> },
                  { path: 'imagenes', element: <ImagesPage /> },
                  { path: 'configuracion', element: <SettingsPage /> },
                ],
              },
            ],
          },
          // Pantallas completas (sin menú lateral)
          { path: 'catalogos/:id', element: <CatalogEditorPage /> },
          { path: 'catalogos/:id/vista-previa', element: <CatalogPreviewPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
