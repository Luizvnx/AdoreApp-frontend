import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useCongregation } from '../context/CongregationContext';
import {
  TrendingUp, Users, UserCheck, DollarSign,
  ArrowUpCircle, ArrowDownCircle, Activity,
  Calendar, ShieldCheck, Building2, BarChart3,
  PieChart, CheckCircle2, Globe
} from 'lucide-react';

interface FinanceMetrics {
  period: string;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  fixedExpenseTotal: number;
  variableExpenseTotal: number;
  projectedFixedExpenses: number;
  monthlyHistory: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

interface AttendanceMetrics {
  summary: {
    totalVisitors: number;
    visitorsThisMonth: number;
    totalServicesRegistered: number;
    overallAvgAttendance: number;
  };
}

export default function PastorDashboard() {
  const { showError } = useToast();
  const { selectedCongregationId, setSelectedCongregationId, congregations } = useCongregation();

  const [loading, setLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [finance, setFinance] = useState<FinanceMetrics | null>(null);
  const [attendance, setAttendance] = useState<AttendanceMetrics | null>(null);

  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [visRes, memRes, finRes, attRes] = await Promise.allSettled([
          api.get(`/visitors?congregationId=${selectedCongregationId}`),
          api.get(`/members?congregationId=${selectedCongregationId}`),
          api.get(`/finance/dashboard?month=${filterMonth}&year=${filterYear}&congregationId=${selectedCongregationId}`),
          api.get(`/attendance/metrics?month=${filterMonth}&year=${filterYear}&congregationId=${selectedCongregationId}`)
        ]);

        if (visRes.status === 'fulfilled') setVisitorCount(visRes.value.data.length);
        if (memRes.status === 'fulfilled') setMemberCount(memRes.value.data.length);
        if (finRes.status === 'fulfilled') setFinance(finRes.value.data);
        if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);

      } catch (error) {
        showError('Erro ao carregar os dados da Gestão Pastoral.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError, filterMonth, filterYear, selectedCongregationId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const months = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  // Cálculo das maiores barras para escala do gráfico
  const maxMonthlyVal = finance?.monthlyHistory?.reduce((max, h) => Math.max(max, h.income, h.expense), 100) || 100;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full pt-safe animate-in fade-in zoom-in-95 duration-500">

      {/* Cabeçalho Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={32} />
            Visão Pastoral Executiva
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Painel de controle financeiro, de membresia e crescimento das congregações.
          </p>
        </div>

        {/* Filtros no Topo */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Globe size={15} className="text-amber-400" />
            <select
              value={selectedCongregationId}
              onChange={e => setSelectedCongregationId(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">Visão Global (Todas)</option>
              {congregations.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name} {c.isHeadquarter ? '(Sede)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Calendar size={15} className="text-slate-400" />
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium outline-none cursor-pointer"
            >
              {months.map(m => <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>)}
            </select>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y} className="bg-slate-900">{y}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* FINANCEIRO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={16} className="text-amber-400" /> Balanço Financeiro Geral
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Mês Ref: {filterMonth.padStart(2, '0')}/{filterYear}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign size={64} className="text-cyan-400" />
            </div>
            <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">SALDO EM CAIXA</p>
            {loading ? (
              <div className="h-8 w-28 bg-slate-800 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-white">
                {finance ? formatCurrency(finance.currentBalance) : 'R$ 0,00'}
              </p>
            )}
            <p className="text-[11px] text-cyan-400/80 mt-2 font-medium">Saldo acumulado consolidado</p>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ArrowUpCircle size={64} className="text-emerald-500" />
            </div>
            <p className="text-emerald-400/80 text-xs font-semibold mb-1 uppercase tracking-wider">ENTRADAS NO MÊS</p>
            {loading ? (
              <div className="h-8 w-28 bg-slate-800 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {finance ? formatCurrency(finance.totalIncome) : 'R$ 0,00'}
              </p>
            )}
            <p className="text-[11px] text-emerald-400/80 mt-2 font-medium">Dízimos, ofertas e doações</p>
          </div>

          <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ArrowDownCircle size={64} className="text-rose-500" />
            </div>
            <p className="text-rose-400/80 text-xs font-semibold mb-1 uppercase tracking-wider">SAÍDAS NO MÊS</p>
            {loading ? (
              <div className="h-8 w-28 bg-slate-800 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-rose-400">
                {finance ? formatCurrency(finance.totalExpense) : 'R$ 0,00'}
              </p>
            )}
            <p className="text-[11px] text-rose-400/80 mt-2 font-medium">Despesas operacionais e fixas</p>
          </div>
        </div>
      </section>

      {/* GRÁFICO VISUAL: EVOLUÇÃO FINANCEIRA 6 MESES & ESTRUTURA DE GASTOS */}
      {finance?.monthlyHistory && finance.monthlyHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Gráfico de Barras de Entradas x Saídas */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-cyan-400" />
                Histórico Financeiro (Últimos 6 Meses)
              </h3>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Entradas</span>
                <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> Saídas</span>
              </div>
            </div>

            <div className="pt-4 flex items-end justify-between gap-2 h-48 border-b border-slate-800/80 px-2">
              {finance.monthlyHistory.map((item, idx) => {
                const incomeHeight = Math.max(10, Math.round((item.income / maxMonthlyVal) * 100));
                const expenseHeight = Math.max(10, Math.round((item.expense / maxMonthlyVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Barra Entrada */}
                      <div
                        style={{ height: `${incomeHeight}%` }}
                        className="w-3.5 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 relative"
                        title={`Entrada: ${formatCurrency(item.income)}`}
                      ></div>
                      {/* Barra Saída */}
                      <div
                        style={{ height: `${expenseHeight}%` }}
                        className="w-3.5 sm:w-5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 relative"
                        title={`Saída: ${formatCurrency(item.expense)}`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Composição de Gastos */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart size={18} className="text-amber-400" />
              Composição de Gastos no Mês
            </h3>

            <div className="space-y-3 font-sans">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Gastos Fixos</span>
                  <span className="text-amber-400">{formatCurrency(finance.fixedExpenseTotal)}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${finance.totalExpense > 0 ? (finance.fixedExpenseTotal / finance.totalExpense) * 100 : 0}%` }}
                    className="bg-amber-500 h-full rounded-full"
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Gastos Variáveis</span>
                  <span className="text-indigo-400">{formatCurrency(finance.variableExpenseTotal)}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${finance.totalExpense > 0 ? (finance.variableExpenseTotal / finance.totalExpense) * 100 : 0}%` }}
                    className="bg-indigo-500 h-full rounded-full"
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Gastos Fixos Projetados:</span>
                <span className="text-white font-mono">{formatCurrency(finance.projectedFixedExpenses)}</span>
              </p>
            </div>
          </div>

        </div>
      )}

      {/* PESSOAS E CULTOS */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Users size={16} className="text-blue-400" /> Membresia e Alcance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">MEMBROS TOTAIS</span>
              <UserCheck size={18} className="text-blue-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-white">{memberCount}</p>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">VISITANTES TOTAIS</span>
              <Users size={18} className="text-cyan-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-white">{visitorCount}</p>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">VISITANTES (MÊS)</span>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-emerald-400">
                {attendance?.summary?.visitorsThisMonth || 0}
              </p>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">MÉDIA NOS CULTOS</span>
              <Activity size={18} className="text-purple-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-purple-400">
                {attendance?.summary?.overallAvgAttendance ? Math.round(attendance.summary.overallAvgAttendance) : 0}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* PAINEL MULTI-CONGREGAÇÕES (SEDE E FILIAIS) */}
      {congregations.length > 0 && (
        <section className="space-y-4 pt-2">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 size={16} className="text-cyan-400" /> Visão Comparativa de Congregações
          </h2>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Congregação</th>
                    <th className="py-3 px-4 text-center">Tipo</th>
                    <th className="py-3 px-4 text-center">Membros</th>
                    <th className="py-3 px-4 text-center">Visitantes</th>
                    <th className="py-3 px-4 text-center">GCs</th>
                    <th className="py-3 px-4 text-right">Lançamentos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {congregations.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <Building2 size={16} className={c.isHeadquarter ? 'text-cyan-400' : 'text-slate-400'} />
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {c.isHeadquarter ? (
                          <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                            <CheckCircle2 size={11} /> SEDE
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px]">
                            FILIAL
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                        {c._count?.users || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                        {c._count?.visitors || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                        {c._count?.connectionGroups || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {c._count?.financialTransactions || 0} reg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
