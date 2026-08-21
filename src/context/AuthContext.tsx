import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';
import { useToast } from './ToastContext';
import { getApiErrorMessage } from '../utils/messageHandler';
import { UI_MESSAGES } from '../constants/messages';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showError } = useToast();

  // Ao carregar a aplicação, restaura a sessão através da rota GET /auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Sessão não ativa ou expirada
        sessionStorage.removeItem('sessionToken');
        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('overrideRole');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // O backend validará a credencial, definirá o Cookie HttpOnly e retornará o token e usuário
      const response = await api.post('/auth/login', { email, password });

      if (!response.data?.user) {
        throw new Error('Servidor não retornou os dados do usuário.');
      }

      if (response.data?.token) {
        // Salva o token na sessão e no localStorage para persistência entre recarregamentos e guias
        sessionStorage.setItem('sessionToken', response.data.token);
        localStorage.setItem('sessionToken', response.data.token);
      }

      sessionStorage.removeItem('overrideRole');
      setUser(response.data.user);
    } catch (err: any) {
      showError(getApiErrorMessage(err, UI_MESSAGES.ERRORS.LOGIN_FAILED));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Falha silenciosa
    } finally {
      sessionStorage.removeItem('sessionToken');
      localStorage.removeItem('sessionToken');
      sessionStorage.removeItem('overrideRole');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
