import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Calendar,
  Plus,
  Trash2,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

interface SummaryData {
  totalVisitors: number;
  visitorsThisMonth: number;
  totalServicesRegistered: number;
  overallAvgAttendance: number;
}

interface MonthMetric {
  label: string;
  monthIndex: number;
  count: number;
}

interface WeekDayMetric {
  day: string;
  dayIndex: number;
  count: number;
}

interface YearMetric {
  year: number;
  count: number;
}

interface ServiceStat {
  serviceName: string;
  totalServices: number;
  totalPeople: number;
  avgPeople: number;
}

interface ServiceRecord {
  id: string;
  date: string;
  serviceName: string;
  attendanceCount: number;
  notes?: string | null;
  createdBy?: {
    fullName: string;
  } | null;
}

const PRESET_SERVICES = [
  'Culto de Domingo - Manhã',
  'Culto de Domingo - Noite',
  'Culto de Terça - Ensino',
  'Culto de Quinta - Oração',
  'Culto de Jovens (Sábado)',
  'Culto de Mulheres',
  'Culto de Homens',
  'Encontro de Casais'
];

export default function ServiceMetrics() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'metrics' | 'register'>('metrics');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Estados de Dados da API
  const [summary, setSummary] = useState<SummaryData>({
    totalVisitors: 0,
    visitorsThisMonth: 0,
    totalServicesRegistered: 0,
    overallAvgAttendance: 0
  });

  const [visitorsByMonth, setVisitorsByMonth] = useState<MonthMetric[]>([]);
  const [visitorsByDayOfWeek, setVisitorsByDayOfWeek] = useState<WeekDayMetric[]>([]);
  const [visitorsByYear, setVisitorsByYear] = useState<YearMetric[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<ServiceRecord[]>([]);

  // Formulário de Lançamento
  const [serviceName, setServiceName] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [attendanceCount, setAttendanceCount] = useState<number | ''>('');
  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, attendanceRes] = await Promise.all([
        api.get('/attendance/metrics'),
        api.get('/attendance')
      ]);

      if (metricsRes.data) {
        setSummary(metricsRes.data.summary || {});
        setVisitorsByMonth(metricsRes.data.visitorsByMonth || []);
        setVisitorsByDayOfWeek(metricsRes.data.visitorsByDayOfWeek || []);
        setVisitorsByYear(metricsRes.data.visitorsByYear || []);
        setServiceStats(metricsRes.data.serviceStats || []);
      }

      if (attendanceRes.data) {
        setAttendanceRecords(attendanceRes.data || []);
      }
    } catch (err) {
      showError(UI_MESSAGES.ERRORS.LOAD_METRICS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedName = serviceName === 'OUTRO' ? customServiceName : serviceName;

    if (!selectedName.trim()) {
      showError('Por favor, informe o nome do culto.');
      return;
    }

    if (attendanceCount === '' || Number(attendanceCount) < 0) {
      showError('Por favor, informe uma quantidade válida de pessoas.');
      return;
    }

    try {
      setSaving(true);

      await api.post('/attendance', {
        date: serviceDate,
        serviceName: selectedName.trim(),
        attendanceCount: Number(attendanceCount),
        notes: notes.trim()
      });

      showSuccess(UI_MESSAGES.SUCCESS.ATTENDANCE_REGISTERED);
      setServiceName('');
      setCustomServiceName('');
      setAttendanceCount('');
      setNotes('');

      // Recarrega os dados e alterna para a aba de histórico/gráficos se desejar
      await fetchData();
    } catch (err: any) {
      showError(getApiErrorMessage(err, UI_MESSAGES.ERRORS.REGISTER_ATTENDANCE));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este registro de culto?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/attendance/${id}`);
      setAttendanceRecords(prev => prev.filter(item => item.id !== id));
      showSuccess(UI_MESSAGES.SUCCESS.ATTENDANCE_DELETED);
      await fetchData();
    } catch (err) {
      showError(UI_MESSAGES.ERRORS.DELETE_ATTENDANCE);
    } finally {
      setDeletingId(null);
    }
  };

  // Cálculos de max de cada gráfico para porcentagem de barras
  const maxMonthCount = Math.max(...visitorsByMonth.map(m => m.count), 1);
  const maxWeekDayCount = Math.max(...visitorsByDayOfWeek.map(d => d.count), 1);
  const maxYearCount = Math.max(...visitorsByYear.map(y => y.count), 1);
  const maxServiceAvg = Math.max(...serviceStats.map(s => s.avgPeople), 1);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans flex flex-col pt-safe pb-28 sm:pb-12 box-border">
      {/* Background glow visual effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      {/* Dynamic Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shrink-0 active:scale-95 touch-manipulation"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center flex-1 min-w-0 px-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-white truncate flex items-center justify-center gap-2">
              <BarChart3 size={20} className="text-cyan-400 shrink-0" />
              <span>Métricas & Cultos</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Indicadores da Igreja e Lançamento de Público
            </p>
          </div>
          <div className="w-10 h-10" />
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 gap-1.5">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 touch-manipulation ${
              activeTab === 'metrics'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={16} />
            <span>Painel de Gráficos</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 touch-manipulation ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus size={16} />
            <span>Lançar Culto</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Carregando métricas e lançamentos...</span>
          </div>
        ) : activeTab === 'metrics' ? (
          /* TAB 1: GRÁFICOS E MÉTRICAS */
          <div className="space-y-6 w-full max-w-full">

            {/* Top Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Total Visitantes
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {summary.totalVisitors}
                  </span>
                  <Users size={18} className="text-cyan-400 shrink-0" />
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Visitantes (Este Mês)
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400">
                    {summary.visitorsThisMonth}
                  </span>
                  <Sparkles size={18} className="text-cyan-400 shrink-0" />
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Cultos Lançados
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {summary.totalServicesRegistered}
                  </span>
                  <Calendar size={18} className="text-blue-400 shrink-0" />
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Média de Público
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {summary.overallAvgAttendance}
                  </span>
                  <Award size={18} className="text-emerald-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* CHART 1: Média de Presença em Pessoas por Tipo de Culto */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl w-full max-w-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Users size={18} className="text-cyan-400" />
                    Média de Público por Culto
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Média de pessoas presentes contadas em cada tipo de culto
                  </p>
                </div>
              </div>

              {serviceStats.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  Nenhum culto lançado ainda. Alterne para a aba "Lançar Culto" para registrar a contagem.
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceStats.map((item, idx) => {
                    const percent = Math.round((item.avgPeople / maxServiceAvg) * 100) || 5;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 truncate pr-2">
                            {item.serviceName}
                          </span>
                          <span className="font-extrabold text-cyan-400 shrink-0">
                            {item.avgPeople} <span className="text-[10px] text-slate-400 font-normal">pessoas / culto</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{item.totalServices} culto(s) registrados</span>
                          <span>Total acumulado: {item.totalPeople}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CHART 2: Visitantes por Mês (Ano Atual) */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl w-full max-w-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-cyan-400" />
                    Visitantes Recebidos por Mês
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evolução dos novos visitantes cadastrados no ano de {new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {/* Responsive Bar Chart */}
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2 items-end h-44 pt-6 pb-2 border-b border-slate-800/60 w-full box-border">
                {visitorsByMonth.map((item, i) => {
                  const heightPercent = maxMonthCount > 0 ? (item.count / maxMonthCount) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-bold text-cyan-400 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.count > 0 ? item.count : ''}
                      </span>
                      <div className="w-full max-w-[28px] bg-slate-950 rounded-t-lg h-full flex items-end p-0.5 border border-slate-800">
                        <div
                          className={`w-full rounded-t-md transition-all duration-700 ${
                            item.count > 0
                              ? 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                              : 'bg-slate-800/30'
                          }`}
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-medium truncate w-full text-center">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRID 2 COLUNAS: Visitantes por Dia da Semana & Por Ano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">

              {/* CHART 3: Visitantes por Dia da Semana */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl w-full overflow-hidden">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                  <Calendar size={16} className="text-cyan-400" />
                  Visitantes por Dia da Semana
                </h3>
                <div className="space-y-3">
                  {visitorsByDayOfWeek.map((item, idx) => {
                    const percent = Math.round((item.count / maxWeekDayCount) * 100) || 4;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">{item.day}</span>
                          <span className="font-bold text-cyan-400">{item.count} visitantes</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHART 4: Visitantes por Ano */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl w-full overflow-hidden">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                  <BarChart3 size={16} className="text-cyan-400" />
                  Crescimento Anual de Visitantes
                </h3>
                <div className="space-y-3">
                  {visitorsByYear.map((item, idx) => {
                    const percent = Math.round((item.count / maxYearCount) * 100) || 4;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">Ano {item.year}</span>
                          <span className="font-bold text-blue-400">{item.count} visitantes</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* TAB 2: LANÇAR FREQUÊNCIA DE CULTO E HISTÓRICO */
          <div className="space-y-6 w-full max-w-full">
            {/* Formulário de Lançamento */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl w-full max-w-full">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
                <Plus size={18} className="text-cyan-400" />
                Registrar Frequência de Culto
              </h2>

              <form onSubmit={handleCreateAttendance} className="space-y-4">
                {/* Data do Culto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Data do Culto
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={serviceDate}
                      onChange={e => setServiceDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3 px-4 text-sm text-white outline-none transition-all touch-manipulation"
                      required
                    />
                  </div>
                </div>

                {/* Seleção do Nome do Culto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Culto / Evento
                  </label>
                  <select
                    value={serviceName}
                    onChange={e => setServiceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3.5 px-4 text-sm text-white outline-none transition-all appearance-none cursor-pointer touch-manipulation"
                    required
                  >
                    <option value="" disabled className="bg-slate-900">Selecione o culto...</option>
                    {PRESET_SERVICES.map(s => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                    <option value="OUTRO" className="bg-slate-900">Outro (Digitar nome do culto...)</option>
                  </select>
                </div>

                {serviceName === 'OUTRO' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Nome do Culto Personalizado
                    </label>
                    <input
                      type="text"
                      value={customServiceName}
                      onChange={e => setCustomServiceName(e.target.value)}
                      placeholder="Ex: Culto Especial de Santa Ceia"
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition-all touch-manipulation"
                      required
                    />
                  </div>
                )}

                {/* Quantidade de Pessoas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Quantidade de Pessoas Contadas
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={attendanceCount}
                      onChange={e => setAttendanceCount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 50 ou 200"
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3.5 px-4 text-sm text-white font-bold placeholder-slate-500 outline-none transition-all touch-manipulation"
                      required
                    />
                  </div>
                </div>

                {/* Observações Opcionais */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Observações (Opcional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: Culto chuvoso / Presença de pregador convidado"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition-all touch-manipulation"
                  />
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Salvar Frequência</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Histórico dos Lançamentos */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl w-full max-w-full overflow-hidden">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-2">
                  <Clock size={18} className="text-cyan-400" />
                  Histórico de Frequência Registrada
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {attendanceRecords.length} registro(s)
                </span>
              </h3>

              {attendanceRecords.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Nenhum culto registrado no histórico.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {attendanceRecords.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {item.serviceName}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 truncate">
                            {item.notes}
                          </p>
                        )}
                        {item.createdBy && (
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            Lançado por: {item.createdBy.fullName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-black text-cyan-400 block">
                            {item.attendanceCount}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                            Pessoas
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteAttendance(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all touch-manipulation"
                          title="Excluir lançamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
