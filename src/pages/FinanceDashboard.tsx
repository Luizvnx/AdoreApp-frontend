import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, DollarSign, PlusCircle, Calendar as CalendarIcon, List, CalendarDays, RefreshCw, FileText, Edit2, History, Filter, Search, Download } from 'lucide-react';
import { exportFinanceToPDF, exportFinanceToExcel } from '../utils/reportUtils';
import { useFinance, type Transaction } from '../hooks/useFinance';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const getPaymentMethodLabel = (method?: string) => {
  switch (method) {
    case 'PIX': return 'Pix';
    case 'DINHEIRO': return 'Dinheiro';
    case 'DEBITO': return 'Débito';
    case 'CREDITO': return 'Crédito';
    case 'TRANSFERENCIA': return 'Transferência';
    default: return method || 'Pix';
  }
};

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { user } = useAuth();
  const isDirector = user?.roles?.includes('DIRECTOR') || user?.role === 'DIRECTOR';

  const {
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
    deleteFixedExpense
  } = useFinance();

  // Filtros do Histórico Completo
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [filterCategory, setFilterCategory] = useState('ALL');

  React.useEffect(() => {
    fetchFilteredTransactions({ month: filterMonth, year: filterYear, category: filterCategory });
  }, [filterMonth, filterYear, filterCategory]);

  // Modals state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showFixedExpenseModal, setShowFixedExpenseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedHistoryTransaction, setSelectedHistoryTransaction] = useState<Transaction | null>(null);

  // Form de Lançamento com Forma de Pagamento
  const [transactionForm, setTransactionForm] = useState({
    title: '',
    type: 'INCOME',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'DIZIMO_OFERTA',
    paymentMethod: 'PIX',
    notes: '',
  });

  const [fixedExpenseForm, setFixedExpenseForm] = useState({
    title: '',
    amount: '',
    dueDate: '1',
    notes: '',
  });

  // Configurações do Relatório Personalizado
  const [reportConfig, setReportConfig] = useState({
    type: 'ALL', // 'ALL' | 'INCOME' | 'EXPENSE'
    period: 'MONTH', // 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'
    paymentMethod: 'ALL',
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [loadingReport, setLoadingReport] = useState(false);

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;

    if (selectedTransactionId) {
      success = await updateTransaction(selectedTransactionId, transactionForm);
    } else {
      success = await createTransaction(transactionForm);
    }

    if (success) {
      setShowTransactionModal(false);
      setSelectedTransactionId(null);
      setTransactionForm({
        ...transactionForm,
        title: '',
        amount: '',
        notes: '',
        paymentMethod: 'PIX'
      });
    }
  };

  const handleEditTransaction = (t: Transaction) => {
    setSelectedTransactionId(t.id);
    setTransactionForm({
      title: t.title,
      type: t.type,
      amount: String(t.amount),
      date: new Date(t.date).toISOString().split('T')[0],
      category: t.category,
      paymentMethod: t.paymentMethod || 'PIX',
      notes: t.notes || ''
    });
    setShowTransactionModal(true);
  };

  const handleViewHistory = (t: Transaction) => {
    setSelectedHistoryTransaction(t);
    setShowHistoryModal(true);
  };

  const handleFixedExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createFixedExpense(fixedExpenseForm);
    if (success) {
      setShowFixedExpenseModal(false);
      setFixedExpenseForm({ ...fixedExpenseForm, title: '', amount: '' });
    }
  };

  // Geração de Relatório PDF / Excel com opções avançadas e totais
  const handleGenerateReport = async (format: 'PDF' | 'EXCEL') => {
    try {
      setLoadingReport(true);
      
      const params: any = {
        type: reportConfig.type,
        paymentMethod: reportConfig.paymentMethod,
      };

      let periodTitle = '';
      if (reportConfig.period === 'CUSTOM') {
        params.startDate = reportConfig.startDate;
        params.endDate = reportConfig.endDate;
        periodTitle = `De ${new Date(reportConfig.startDate).toLocaleDateString('pt-BR')} até ${new Date(reportConfig.endDate).toLocaleDateString('pt-BR')}`;
      } else if (reportConfig.period === 'WEEK') {
        params.period = 'WEEK';
        periodTitle = 'Da Semana Atual';
      } else if (reportConfig.period === 'YEAR') {
        params.period = 'YEAR';
        params.year = reportConfig.year;
        periodTitle = `Ano Completo (${reportConfig.year})`;
      } else {
        params.month = reportConfig.month;
        params.year = reportConfig.year;
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        periodTitle = `${monthNames[Number(reportConfig.month) - 1]} / ${reportConfig.year}`;
      }

      // Adiciona detalhamento do filtro de tipo no título
      if (reportConfig.type === 'INCOME') periodTitle += ' (Somente Entradas)';
      if (reportConfig.type === 'EXPENSE') periodTitle += ' (Somente Saídas)';
      if (reportConfig.paymentMethod !== 'ALL') periodTitle += ` [Forma: ${getPaymentMethodLabel(reportConfig.paymentMethod)}]`;

      const res = await api.get('/finance/transactions', { params });
      const data = res.data;

      if (!data || data.length === 0) {
        showError('Nenhuma movimentação encontrada para os filtros selecionados.');
        return;
      }

      if (format === 'PDF') {
        exportFinanceToPDF(data, periodTitle);
        showSuccess('Relatório PDF gerado com sucesso!');
      } else {
        exportFinanceToExcel(data, periodTitle);
        showSuccess('Relatório Excel gerado com sucesso!');
      }

      setShowReportModal(false);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showError('Erro ao gerar relatório.');
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24 relative overflow-x-hidden">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-1.5 shrink-0">
            <ArrowLeft size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Wallet size={18} className="text-emerald-500 shrink-0" /> Tesouraria
            </h1>
            <p className="text-xs text-emerald-400 truncate">Visão Geral - {metrics?.period}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowReportModal(true)} title="Gerar Relatório Financeiro" className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow">
            <FileText size={16} /> <span className="hidden xs:inline">Relatórios</span>
          </button>
          <button onClick={fetchData} title="Atualizar Dados" className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full ml-1">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-2">
              <TrendingUp size={16} className="shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Entradas (Mês)</span>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-extrabold text-white whitespace-nowrap truncate" title={formatCurrency(metrics?.totalIncome || 0)}>
              {formatCurrency(metrics?.totalIncome || 0)}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-red-400 mb-2">
              <TrendingDown size={16} className="shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Saídas (Mês)</span>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-extrabold text-white whitespace-nowrap truncate" title={formatCurrency(metrics?.totalExpense || 0)}>
              {formatCurrency(metrics?.totalExpense || 0)}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 mb-2">
              <CalendarDays size={16} className="shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Gastos Fixos Proj.</span>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-extrabold text-white whitespace-nowrap truncate" title={formatCurrency(metrics?.projectedFixedExpenses || 0)}>
              {formatCurrency(metrics?.projectedFixedExpenses || 0)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 border border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-100 mb-2">
              <DollarSign size={16} className="shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate">Saldo Geral Caixa</span>
            </div>
            <p 
              className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight whitespace-nowrap truncate ${
                (metrics?.currentBalance || 0) < 0 ? 'text-red-300' : 'text-white'
              }`}
              title={formatCurrency(metrics?.currentBalance || 0)}
            >
              {formatCurrency(metrics?.currentBalance || 0)}
            </p>
          </div>
        </div>

        {/* Ações Rápidas - Ocultas para Diretoria */}
        {!isDirector && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setTransactionForm({ ...transactionForm, type: 'INCOME', paymentMethod: 'PIX' }); setShowTransactionModal(true); }}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <TrendingUp size={24} />
              <span className="text-sm font-semibold">Nova Entrada</span>
            </button>

            <button
              onClick={() => { setTransactionForm({ ...transactionForm, type: 'EXPENSE', paymentMethod: 'PIX' }); setShowTransactionModal(true); }}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              <TrendingDown size={24} />
              <span className="text-sm font-semibold">Nova Saída</span>
            </button>
          </div>
        )}

        {/* Histórico Recente e Gastos Fixos */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Lançamentos Recentes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <List size={16} className="text-emerald-500" /> Últimas Movimentações
              </h2>
            </div>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhuma movimentação registrada.</p>
              ) : (
                recentTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {t.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-200">{t.title}</p>
                          {(t.editHistory && t.editHistory.length > 0) && (
                            <button
                              onClick={() => handleViewHistory(t)}
                              className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-amber-500/30"
                              title="Ver histórico de edições"
                            >
                              <History size={10} /> Editado
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {new Date(t.date).toLocaleDateString()} - {t.category.replace('_', ' ')} • <span className="text-cyan-400 font-medium">{getPaymentMethodLabel(t.paymentMethod)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      {!isDirector && (
                        <button
                          onClick={() => handleEditTransaction(t)}
                          className="text-slate-500 hover:text-cyan-400 transition-colors"
                          title="Editar Lançamento"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gastos Fixos Programados */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <CalendarIcon size={16} className="text-amber-500" /> Gastos Fixos Programados
              </h2>
              {!isDirector && (
                <button onClick={() => setShowFixedExpenseModal(true)} className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
                  <PlusCircle size={14} /> Adicionar
                </button>
              )}
            </div>
            <div className="space-y-3">
              {fixedExpenses.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum gasto fixo cadastrado.</p>
              ) : (
                fixedExpenses.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{f.title}</p>
                      <p className="text-[10px] text-amber-500/80">Vencimento dia {f.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-400">{formatCurrency(f.amount)}</span>
                      {!isDirector && (
                        <button onClick={() => deleteFixedExpense(f.id)} className="text-slate-600 hover:text-red-400">
                          <ArrowLeft size={14} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Histórico Completo de Movimentações */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-cyan-400" /> Histórico Completo
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-cyan-500 transition-colors">
                <Filter size={14} className="text-slate-500 mr-2" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-sm text-slate-300 outline-none w-32"
                >
                  <option value="ALL">Todas Categorias</option>
                  <option value="DIZIMO_OFERTA">Dízimo ou Oferta</option>
                  <option value="DOACAO">Doação</option>
                  <option value="EVENTOS">Eventos</option>
                  <option value="GASTO_FIXO">Gasto Fixo</option>
                  <option value="GASTO_VARIAVEL">Gasto Variável</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-cyan-500"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                onClick={() => fetchFilteredTransactions({ month: filterMonth, year: filterYear, category: filterCategory })}
                disabled={loadingHistory}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                title="Buscar"
              >
                {loadingHistory ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <Search size={16} />}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-semibold pl-2">Data</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Descrição</th>
                  <th className="pb-3 font-semibold">Forma de Pagto</th>
                  <th className="pb-3 font-semibold">Categoria</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right pr-2">Valor</th>
                  <th className="pb-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-sm text-slate-500 py-8">
                      Nenhuma movimentação encontrada para estes filtros.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="py-4 pl-2 text-sm text-slate-300 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-slate-200 font-medium">
                        {t.title}
                      </td>
                      <td className="py-4 text-sm text-cyan-400 font-medium">
                        {getPaymentMethodLabel(t.paymentMethod)}
                      </td>
                      <td className="py-4 text-sm text-slate-400">
                        {t.category.replace('_', ' ')}
                      </td>
                      <td className="py-4">
                        {(t.editHistory && t.editHistory.length > 0) ? (
                          <button
                            onClick={() => handleViewHistory(t)}
                            className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-amber-500/20 transition-colors"
                            title="Ver histórico de edições"
                          >
                            <History size={10} /> Editado
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold uppercase text-slate-600 px-2 py-0.5">Original</span>
                        )}
                      </td>
                      <td className={`py-4 text-sm font-bold text-right pr-2 whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="py-4 text-center">
                        {!isDirector && (
                          <button
                            onClick={() => handleEditTransaction(t)}
                            className="text-slate-500 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar Lançamento"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Transação com Forma de Pagamento */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">
                {selectedTransactionId
                  ? 'Editar Lançamento'
                  : (transactionForm.type === 'INCOME' ? 'Lançar Nova Entrada' : 'Lançar Nova Saída')
                }
              </h3>
              <button onClick={() => {
                setShowTransactionModal(false);
                setSelectedTransactionId(null);
                setTransactionForm({ ...transactionForm, title: '', amount: '' });
              }} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400">Título / Descrição</label>
                <input required type="text" value={transactionForm.title} onChange={e => setTransactionForm({ ...transactionForm, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Valor (R$)</label>
                  <input required type="number" step="0.01" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-white focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Data</label>
                  <input required type="date" value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-slate-300 focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Categoria</label>
                  <select required value={transactionForm.category} onChange={e => setTransactionForm({ ...transactionForm, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-slate-300 focus:border-emerald-500 outline-none">
                    {transactionForm.type === 'INCOME' ? (
                      <>
                        <option value="DIZIMO_OFERTA">Dízimo ou Oferta</option>
                        <option value="DOACAO">Doação</option>
                        <option value="EVENTOS">Eventos</option>
                        <option value="OUTROS">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="GASTO_FIXO">Gasto Fixo (Água, Luz, Aluguel)</option>
                        <option value="GASTO_VARIAVEL">Gasto Variável</option>
                        <option value="MANUTENCAO">Manutenção / Equipamentos</option>
                        <option value="EVENTOS">Eventos</option>
                        <option value="OUTROS">Outros</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Forma de Pagamento</label>
                  <select required value={transactionForm.paymentMethod} onChange={e => setTransactionForm({ ...transactionForm, paymentMethod: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-slate-300 focus:border-emerald-500 outline-none">
                    <option value="PIX">Pix</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO">Crédito</option>
                    <option value="TRANSFERENCIA">Transferência Bancária</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={`w-full font-bold py-3 rounded-xl mt-2 transition-colors ${transactionForm.type === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'}`}>
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Gasto Fixo */}
      {showFixedExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Cadastrar Gasto Fixo</h3>
              <button onClick={() => setShowFixedExpenseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleFixedExpenseSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400">Nome da Despesa (Ex: Conta de Luz)</label>
                <input required type="text" value={fixedExpenseForm.title} onChange={e => setFixedExpenseForm({ ...fixedExpenseForm, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Valor Médio (R$)</label>
                  <input required type="number" step="0.01" value={fixedExpenseForm.amount} onChange={e => setFixedExpenseForm({ ...fixedExpenseForm, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Dia de Vencimento (1 a 31)</label>
                  <input required type="number" min="1" max="31" value={fixedExpenseForm.dueDate} onChange={e => setFixedExpenseForm({ ...fixedExpenseForm, dueDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-1 text-sm text-slate-300 focus:border-amber-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 font-bold py-3 rounded-xl mt-2 text-white shadow-lg shadow-amber-500/20 transition-colors">
                Salvar Gasto Fixo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Edições */}
      {showHistoryModal && selectedHistoryTransaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <History size={18} className="text-amber-500" /> Histórico de Edições
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-white">{selectedHistoryTransaction.title}</p>
                <p className="text-xs text-slate-400">Criado por {selectedHistoryTransaction.createdBy?.fullName || 'Desconhecido'}</p>
              </div>

              {selectedHistoryTransaction.editHistory?.map((history: any, index: number) => (
                <div key={index} className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-800/50 p-3 flex justify-between items-center border-b border-slate-800">
                    <span className="text-xs text-amber-400 font-bold">
                      Edição #{index + 1} - {history.editedByName || selectedHistoryTransaction.editedBy?.fullName || 'Desconhecido'}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(history.editedAt).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {Object.entries(history.changes).map(([field, diff]: [string, any]) => (
                      <div key={field} className="text-sm font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                        <p className="text-xs font-sans text-slate-500 mb-2 uppercase tracking-wider">{field}</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-red-400 bg-red-950/30 px-2 py-1 rounded">
                            <span className="w-4">-</span>
                            <span className="line-through opacity-80">{String(diff.old)}</span>
                          </div>
                          <div className="flex items-center text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded">
                            <span className="w-4">+</span>
                            <span>{String(diff.new)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button onClick={() => setShowHistoryModal(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração e Geração de Relatórios Personalizados */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <FileText size={18} className="text-emerald-500" /> Geração de Relatório Financeiro
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Lançamento</label>
                <select
                  value={reportConfig.type}
                  onChange={e => setReportConfig({ ...reportConfig, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Entradas e Saídas</option>
                  <option value="INCOME">Somente Entradas</option>
                  <option value="EXPENSE">Somente Saídas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Forma de Pagamento</label>
                <select
                  value={reportConfig.paymentMethod}
                  onChange={e => setReportConfig({ ...reportConfig, paymentMethod: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Todas as Formas de Pagamento</option>
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="DEBITO">Débito</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="TRANSFERENCIA">Transferência Bancária</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Período de Seleção</label>
                <select
                  value={reportConfig.period}
                  onChange={e => setReportConfig({ ...reportConfig, period: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="WEEK">Da Semana Atual</option>
                  <option value="MONTH">Do Mês</option>
                  <option value="YEAR">Do Ano Completo</option>
                  <option value="CUSTOM">Filtro por Data (Personalizado)</option>
                </select>
              </div>

              {reportConfig.period === 'MONTH' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Mês</label>
                    <select
                      value={reportConfig.month}
                      onChange={e => setReportConfig({ ...reportConfig, month: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                    >
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Ano</label>
                    <select
                      value={reportConfig.year}
                      onChange={e => setReportConfig({ ...reportConfig, year: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                    >
                      {[2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {reportConfig.period === 'YEAR' && (
                <div>
                  <label className="text-xs text-slate-400">Ano</label>
                  <select
                    value={reportConfig.year}
                    onChange={e => setReportConfig({ ...reportConfig, year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              {reportConfig.period === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Data Inicial</label>
                    <input
                      type="date"
                      value={reportConfig.startDate}
                      onChange={e => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Data Final</label>
                    <input
                      type="date"
                      value={reportConfig.endDate}
                      onChange={e => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 font-mono mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                * O relatório final gerado conterá a lista detalhada das movimentações e os totais de Entradas, Saídas e Saldo Consolidado no rodapé.
              </p>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950">
              <button
                onClick={() => handleGenerateReport('PDF')}
                disabled={loadingReport}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Download size={14} /> Exportar PDF
              </button>
              <button
                onClick={() => handleGenerateReport('EXCEL')}
                disabled={loadingReport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Download size={14} /> Exportar Excel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
