import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { onUnauthorized } from '../services/apiClient.js';
import { tokenStorage } from '../services/tokenStorage.js';

const AuthContext = createContext(null);

/**
 * Estado de autenticación: 'checking' → 'authenticated' | 'anonymous'.
 * Al iniciar, el token se valida contra el backend (/auth/me).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'checking' : 'anonymous'));
  const [sessionMessage, setSessionMessage] = useState('');

  const clearSession = useCallback((message = '') => {
    tokenStorage.clear();
    setUser(null);
    setStatus('anonymous');
    setSessionMessage(message);
  }, []);

  useEffect(() => {
    onUnauthorized((error) => clearSession(error.message || 'Tu sesión expiró.'));
  }, [clearSession]);

  useEffect(() => {
    if (status !== 'checking') return;
    let cancelled = false;
    authService
      .me()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setStatus('authenticated');
      })
      .catch(() => !cancelled && clearSession());
    return () => {
      cancelled = true;
    };
  }, [status, clearSession]);

  const login = useCallback(async (credentials) => {
    const { token, user: profile } = await authService.login(credentials);
    tokenStorage.set(token);
    setUser(profile);
    setSessionMessage('');
    setStatus('authenticated');
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, isAuthenticated: status === 'authenticated', login, logout, sessionMessage }),
    [user, status, login, logout, sessionMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
