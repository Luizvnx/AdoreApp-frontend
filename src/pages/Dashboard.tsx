import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, UserCheck, Briefcase, MapPin, Calendar, TrendingUp } from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();

  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const currentUser: User = user || {
    id: '123',
    name: 'Membro',
    role: 'MEMBER',
  };

  const userRoles = currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles : [currentUser.role];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const hasAnyRole = (roles: string[]) => {
    if (isSuperAdmin) return true;
    return userRoles.some(r => roles.includes(r));
  };

  const canSeeVisitors = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR']);
  const canSeeMembers = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR']);

  useEffect(() => {
    if (!user) return;
    
    setLoadingMetrics(true);
    
    const fetchPromises = [];

    if (canSeeVisitors) {
      fetchPromises.push(
        api.get('/visitors')
          .then(res => setVisitorCount(res.data.length))
          .catch(err => {
            if (err.response?.status !== 401) showError('Erro ao buscar visitantes.');
          })
      );
    }
    
    if (canSeeMembers) {
      fetchPromises.push(
        api.get('/members')
          .then(res => setMemberCount(res.data.length))
          .catch(err => {
            if (err.response?.status !== 401) showError('Erro ao buscar membros.');
          })
      );
    }

    Promise.all(fetchPromises).finally(() => setLoadingMetrics(false));
  }, [canSeeVisitors, canSeeMembers, user, showError]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full pt-safe animate-in fade-in zoom-in-95 duration-500">
      
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-cyan-900/40 to-slate-900 border border-slate-800/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            Olá, {currentUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-cyan-400 font-medium mb-4">{currentUser.role.replace('_', ' ')}</p>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Bem-vindo ao AvivaApp. Acesse rapidamente os dados mais importantes da igreja logo abaixo, ou use o menu de navegação.
          </p>
        </div>
      </section>

      {/* Métricas Resumidas */}
      {(canSeeVisitors || canSeeMembers) && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {canSeeVisitors && (
            <div
              onClick={() => navigate('/hub/visitantes')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-center cursor-pointer transition-all group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-cyan-500" />
                  VISITANTES
                </span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </div>
              {loadingMetrics ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse mt-1"></div>
              ) : (
                <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight">
                  {visitorCount ?? 0}
                </span>
              )}
            </div>
          )}
          {canSeeMembers && (
            <div
              onClick={() => navigate('/hub/membros')}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col justify-center cursor-pointer transition-all group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <Users size={12} className="text-blue-500" />
                  MEMBROS
                </span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
              {loadingMetrics ? (
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse mt-1"></div>
              ) : (
                <span className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
                  {memberCount ?? 0}
                </span>
              )}
            </div>
          )}
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Informativo do GC do Membro Logado */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              Seu Grupo de Conexão (GC)
            </h3>
            {currentUser.connectionGroup && (
              <span className="bg-cyan-500/10 text-cyan-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md border border-cyan-500/20">
                Oficial
              </span>
            )}
          </div>

          {currentUser.connectionGroup ? (
            <div className="space-y-3">
              <h4 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                GC {currentUser.connectionGroup.name}
              </h4>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                {currentUser.connectionGroup.neighborhood && (
                  <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                    <div className="bg-slate-800 p-1.5 rounded-lg"><MapPin size={16} className="text-slate-400" /></div>
                    <span className="font-medium text-slate-200">{currentUser.connectionGroup.neighborhood}</span>
                  </div>
                )}
                {(currentUser.connectionGroup.meetingDay || currentUser.connectionGroup.meetingTime) && (
                  <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                    <div className="bg-slate-800 p-1.5 rounded-lg"><Calendar size={16} className="text-slate-400" /></div>
                    <span className="font-medium text-slate-200">
                      {currentUser.connectionGroup.meetingDay || ''} {currentUser.connectionGroup.meetingTime ? `às ${currentUser.connectionGroup.meetingTime}` : ''}
                    </span>
                  </div>
                )}
                {currentUser.connectionGroup.leader?.fullName && (
                  <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                    <div className="bg-slate-800 p-1.5 rounded-lg"><UserCheck size={16} className="text-slate-400" /></div>
                    <span className="font-medium text-slate-200">{currentUser.connectionGroup.leader.fullName}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 flex flex-col items-center text-center gap-3">
              <MapPin size={24} className="text-slate-600" />
              <p>Você ainda não possui um GC vinculado. Fale com a liderança para se conectar!</p>
            </div>
          )}
        </section>

        {/* Card Informativo dos Cargos & Ministérios do Membro Logado */}
        {currentUser.memberProfile?.ministries && currentUser.memberProfile.ministries.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-colors">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Briefcase size={18} className="text-blue-400" />
              Seus Cargos & Ministérios
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {currentUser.memberProfile.ministries.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  {m}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}