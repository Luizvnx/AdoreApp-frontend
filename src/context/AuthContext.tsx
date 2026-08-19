import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, overrideRole?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ao carregar a aplicação, restaura a sessão através da rota GET /auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.user) {
          const savedOverrideRole = sessionStorage.getItem('overrideRole') as UserRole | null;
          if (savedOverrideRole) {
            setUser({
              ...response.data.user,
              role: savedOverrideRole,
              roles: [savedOverrideRole]
            });
          } else {
            setUser(response.data.user);
          }
        }
      } catch (err) {
        // Sessão não ativa ou expirada
        sessionStorage.removeItem('sessionToken');
        sessionStorage.removeItem('overrideRole');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string, overrideRole?: UserRole) => {
    try {
      // O backend validará a credencial, definirá o Cookie HttpOnly e retornará o token e usuário
      const response = await api.post('/auth/login', { email, password });

      if (!response.data?.user) {
        throw new Error('Servidor não retornou os dados do usuário.');
      }

      if (response.data?.token) {
        // Salva o token na sessão da aba para navegadores móveis com restrição ITP (Safari/iOS)
        sessionStorage.setItem('sessionToken', response.data.token);
      }

      let userObj = response.data.user;
      if (overrideRole) {
        sessionStorage.setItem('overrideRole', overrideRole);
        userObj = {
          ...userObj,
          role: overrideRole,
          roles: [overrideRole]
        };
      } else {
        sessionStorage.removeItem('overrideRole');
      }

      setUser(userObj);
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Erro ao efetuar logout no servidor:', err);
    } finally {
      sessionStorage.removeItem('sessionToken');
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
