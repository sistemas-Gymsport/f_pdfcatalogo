import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { googleFontsUrl } from './shared/renderModel.js';
import App from './App.jsx';
import './styles/global.css';

// Las mismas fuentes de Google que usa el PDF (el navegador solo descarga las que se usan).
const fonts = document.createElement('link');
fonts.rel = 'stylesheet';
fonts.href = googleFontsUrl();
document.head.appendChild(fonts);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: (failureCount, error) => error?.status >= 500 && failureCount < 2,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
