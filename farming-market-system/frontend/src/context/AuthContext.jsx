import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function roleHome(role) {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard';
    case 'FARMER': return '/farmer/dashboard';
    case 'BUYER': return '/';
    case 'DELIVERY_AGENT': return '/agent/dashboard';
    default: return '/';
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  });

  const login = (payload) => {
    const next = {
      token: payload.token,
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
    localStorage.setItem('token', next.token);
    localStorage.setItem('auth', JSON.stringify(next));
    setAuth(next);
    return roleHome(next.role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    setAuth(null);
  };

  const value = useMemo(() => ({ auth, login, logout, roleHome }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
