import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  TrendingUp, Users, UserCheck, DollarSign,
  ArrowUpCircle, ArrowDownCircle, Activity,
  Calendar, ShieldCheck
} from 'lucide-react';

interface FinanceMetrics {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
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
          api.get('/visitors'),
          api.get('/members'),
          api.get(`/finance/metrics?month=${filterMonth}&year=${filterYear}`),
          api.get(`/attendance/metrics?month=${filterMonth}&year=${filterYear}`)
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
  }, [showError, filterMonth, filterYear]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const months = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full pt-safe animate-in fade-in zoom-in-95 duration-500">

      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={32} />
            Visão Pastoral
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Resumo executivo de todas as áreas da igreja.</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-500 hidden sm:block" />
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-cyan-500 transition-colors"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-cyan-500 transition-colors"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      {/* FINANCEIRO */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <DollarSign size={16} /> Financeiro (Mês Atual)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign size={64} className="text-blue-500" />
            </div>
            <p className="text-slate-400 text-xs font-semibold mb-1">SALDO EM CAIXA</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-800 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl font-black text-white">{finance ? formatCurrency(finance.currentBalance) : 'R$ 0,00'}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ArrowUpCircle size={64} className="text-emerald-500" />
            </div>
            <p className="text-emerald-400/80 text-xs font-semibold mb-1">ENTRADAS</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-800 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl font-black text-emerald-400">{finance ? formatCurrency(finance.totalIncome) : 'R$ 0,00'}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-rose-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ArrowDownCircle size={64} className="text-rose-500" />
            </div>
            <p className="text-rose-400/80 text-xs font-semibold mb-1">SAÍDAS</p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-800 animate-pulse rounded mt-2"></div>
            ) : (
              <p className="text-2xl font-black text-rose-400">{finance ? formatCurrency(finance.totalExpense) : 'R$ 0,00'}</p>
            )}
          </div>
        </div>
      </section>

      {/* PESSOAS E CULTOS */}
      <section className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Users size={16} /> Membresia e Crescimento
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">MEMBROS TOTAIS</span>
              <UserCheck size={16} className="text-blue-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-white">{memberCount}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">VISITANTES TOTAIS</span>
              <Users size={16} className="text-cyan-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-white">{visitorCount}</p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">VISITANTES (MÊS)</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-black text-emerald-400">
                {attendance?.summary?.visitorsThisMonth || 0}
              </p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs font-semibold">MÉDIA NOS CULTOS</span>
              <Activity size={16} className="text-purple-400" />
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

    </div>
  );
}
