import React, { createContext, useContext, useState, useEffect } from 'react';

const USERS = [
  { username: 'testuser', password: 'test@123', displayName: 'Test User', avatar: 'TU' }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('vibecode_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const login = (username, password) => {
    const found = USERS.find(u => u.username === username && u.password === password);
    if (!found) return false;
    const u = { username: found.username, displayName: found.displayName, avatar: found.avatar };
    setUser(u);
    localStorage.setItem('vibecode_user', JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vibecode_user');
    localStorage.removeItem('vibecode_project');
    localStorage.removeItem('vibecode_messages');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
