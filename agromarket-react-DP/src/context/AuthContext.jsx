import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';

// null по умолчанию: так видно, что компонент отрендерен без <AuthProvider>
export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null; // в localStorage мусор — считаем, что не входили
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Вход / регистрация: сервер вернул { user, token }
  const login = useCallback((newUser, newToken) => {
    if (newToken) localStorage.setItem('token', newToken);
    if (newUser) localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken ?? null);
    setUser(newUser ?? null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // При загрузке страницы проверяем сохранённый токен (ЛР7: GET /auth/me).
  // При 401 apiFetch сам очистит localStorage и перезагрузит страницу.
  useEffect(() => {
    if (!localStorage.getItem('token')) return; // не входили — проверять нечего
    let cancelled = false;
    apiFetch('/auth/me')
      .then((me) => {
        if (cancelled || !me) return;
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(user), login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() нужно вызывать внутри <AuthProvider>');
  }
  return ctx;
}
