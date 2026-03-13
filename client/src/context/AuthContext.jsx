import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // VULN: V8.2 - Auth state stored in localStorage (accessible via XSS)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('vulnlab_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('vulnlab_token'));

  const login = async (email, password, otp) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, otp }),
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // VULN: V8.2 - Store auth data in localStorage
    localStorage.setItem('vulnlab_user', JSON.stringify(data.user));
    localStorage.setItem('vulnlab_token', data.token);
    localStorage.setItem('vulnlab_role', data.user.role);
    localStorage.setItem('vulnlab_sessionId', data.sessionId);

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
    // VULN: V3.3 - Only clears client-side state
    localStorage.removeItem('vulnlab_user');
    localStorage.removeItem('vulnlab_token');
    localStorage.removeItem('vulnlab_role');
    localStorage.removeItem('vulnlab_sessionId');
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
