import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface Congregation {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  foundedAt?: string | null;
  isHeadquarter: boolean;
  _count?: {
    users: number;
    visitors: number;
    connectionGroups: number;
    financialTransactions: number;
  };
}

interface CongregationContextType {
  congregations: Congregation[];
  selectedCongregationId: string; // 'ALL' ou id especifico
  setSelectedCongregationId: (id: string) => void;
  loading: boolean;
  fetchCongregations: () => Promise<void>;
  currentCongregationName: string;
}

const CongregationContext = createContext<CongregationContextType | undefined>(undefined);

export const CongregationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedCongregationId, setSelectedCongregationId] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchCongregations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/congregations');
      setCongregations(res.data);
    } catch (err) {
      console.error('Erro ao buscar congregações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCongregations();
  }, [user]);

  // Se o usuário não for SUPER_ADMIN, a congregação selecionada trava na congregação dele
  useEffect(() => {
    if (user && !user.roles?.includes('SUPER_ADMIN') && user.role !== 'SUPER_ADMIN') {
      if (user.congregationId) {
        setSelectedCongregationId(user.congregationId);
      }
    }
  }, [user]);

  const currentCongregationName = React.useMemo(() => {
    if (selectedCongregationId === 'ALL') return 'Visão Global (Sede + Filiais)';
    const found = congregations.find(c => c.id === selectedCongregationId);
    return found ? `${found.name}${found.isHeadquarter ? ' (Sede)' : ''}` : 'Congregação Selecionada';
  }, [selectedCongregationId, congregations]);

  return (
    <CongregationContext.Provider
      value={{
        congregations,
        selectedCongregationId,
        setSelectedCongregationId,
        loading,
        fetchCongregations,
        currentCongregationName
      }}
    >
      {children}
    </CongregationContext.Provider>
  );
};

export const useCongregation = () => {
  const context = useContext(CongregationContext);
  if (!context) {
    throw new Error('useCongregation deve ser usado dentro de um CongregationProvider');
  }
  return context;
};
