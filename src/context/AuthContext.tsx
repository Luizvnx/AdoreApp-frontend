import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, UserRole } from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, selectedRole: UserRole = 'SUPER_ADMIN') => {
    setLoading(true);
    try {
      // Realiza a autenticação via Axios no backend de verdade
      const response = await api.post('/auth/login', { email, password });

      const authToken = response.data.token || response.data.accessToken;
      const userData: User = response.data.user || {
        id: response.data.id || 'usr_1',
        name: response.data.name || email.split('@')[0],
        role: response.data.role || selectedRole,
      };

      if (!authToken) {
        throw new Error('Servidor não retornou um token de autenticação válido.');
      }

      // Persiste no localStorage APENAS quando o backend autenticar com sucesso
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
    } catch (err: any) {
      console.error('Erro na autenticação real:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
