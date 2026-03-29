import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Session check ───────────────────────────────────────────────
  // Without this, every refresh would log you out.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data.user);
      } catch {
        // 401 means no valid session — user is not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>

      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook — components never import AuthContext directly.

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};