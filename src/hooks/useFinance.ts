import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export interface Transaction {
  id: string;
  title: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
  service?: { serviceName: string };
  createdBy?: { fullName: string };
  editedBy?: { fullName: string };
  editHistory?: {
    editedAt: string;
    editedById?: string;
    editedByName?: string;
    changes: Record<string, { old: any; new: any }>;
  }[];
}

export interface FixedExpense {
  id: string;
  title: string;
  amount: number;
  dueDate: number;
  isActive: boolean;
  notes?: string;
}

export interface DashboardMetrics {
  period: string;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  fixedExpenseTotal: number;
  variableExpenseTotal: number;
  projectedFixedExpenses: number;
  monthlyHistory: { month: string; income: number; expense: number }[];
}

export function useFinance() {
  const { showError, showSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, transRes, fixedRes] = await Promise.all([
        api.get('/finance/dashboard'),
        api.get('/finance/transactions'),
        api.get('/finance/fixed-expenses'),
      ]);
      setMetrics(metricsRes.data);
      setRecentTransactions(transRes.data.slice(0, 10));
      setFixedExpenses(fixedRes.data);
    } catch (error: any) {
      console.error("ERRO NO USEFINANCE:", error?.response?.data || error);
      showError('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredTransactions = async (monthOrParams: string | object, year?: string, category?: string) => {
    try {
      setLoadingHistory(true);
      const params = typeof monthOrParams === 'object' 
        ? monthOrParams 
        : { month: monthOrParams, year, category };
        
      const res = await api.get('/finance/transactions', { params });
      setFilteredTransactions(res.data);
      return res.data;
    } catch (error) {
      showError('Erro ao buscar histórico de transações.');
      return [];
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createTransaction = async (data: any) => {
    try {
      await api.post('/finance/transactions', data);
      showSuccess('Transação registrada com sucesso!');
      await fetchData();
      return true;
    } catch (error) {
      showError('Erro ao registrar transação.');
      return false;
    }
  };

  const updateTransaction = async (id: string, data: any) => {
    try {
      await api.put(`/finance/transactions/${id}`, data);
      showSuccess('Transação atualizada com sucesso!');
      await fetchData();
      return true;
    } catch (error) {
      showError('Erro ao editar transação.');
      return false;
    }
  };

  const createFixedExpense = async (data: any) => {
    try {
      await api.post('/finance/fixed-expenses', data);
      showSuccess('Gasto fixo registrado com sucesso!');
      await fetchData();
      return true;
    } catch (error) {
      showError('Erro ao registrar gasto fixo.');
      return false;
    }
  };

  const deleteFixedExpense = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este gasto fixo?')) return false;
    try {
      await api.delete(`/finance/fixed-expenses/${id}`);
      showSuccess('Gasto fixo removido.');
      await fetchData();
      return true;
    } catch (error) {
      showError('Erro ao excluir gasto fixo.');
      return false;
    }
  };

  return {
    loading,
    metrics,
    recentTransactions,
    fixedExpenses,
    filteredTransactions,
    loadingHistory,
    fetchData,
    fetchFilteredTransactions,
    createTransaction,
    updateTransaction,
    createFixedExpense,
    deleteFixedExpense,
  };
}
