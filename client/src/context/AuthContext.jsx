import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dvca_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('dvca_token'));

  const login = async (email, password, otp) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, otp }),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem('dvca_user', JSON.stringify(data.user));
    localStorage.setItem('dvca_token', data.token);
    localStorage.setItem('dvca_role', data.user.role);
    localStorage.setItem('dvca_sessionId', data.sessionId);

    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('dvca_user');
    localStorage.removeItem('dvca_token');
    localStorage.removeItem('dvca_role');
    localStorage.removeItem('dvca_sessionId');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
