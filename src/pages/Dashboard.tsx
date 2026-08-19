import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, LogOut, ChevronRight, Users, UserCheck, Briefcase, MapPin, Calendar, BarChart3 } from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const currentUser: User = user || {
    id: '123',
    name: 'Membro',
    role: 'MEMBER',
  };

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  // Helper de RBAC (Role-Based Access Control)
  const userRoles = currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles : [currentUser.role];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const hasAnyRole = (roles: string[]) => {
    if (isSuperAdmin) return true;
    return userRoles.some(r => roles.includes(r));
  };

  const canSeeVisitors = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR']);
  const canRegisterVisitors = hasAnyRole(['ADMIN_WELCOME']);
  const canSeeMembers = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR']);
  const canManageCargos = hasAnyRole(['WORSHIP_LEADER']);
  const canManageGCs = hasAnyRole(['GC_SUPERVISOR', 'GC_LEADER']);
  const canSeeMetrics = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR', 'WORSHIP_LEADER']);

  const { showError } = useToast();

  useEffect(() => {
    if (canSeeVisitors) {
      api.get('/visitors')
        .then(res => setVisitorCount(res.data.length))
        .catch(() => showError('Erro ao buscar total de visitantes.'));
    }
    if (canSeeMembers) {
      api.get('/members')
        .then(res => setMemberCount(res.data.length))
        .catch(() => showError('Erro ao buscar total de membros.'));
    }
  }, [canSeeVisitors, canSeeMembers]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-24">
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 pt-safe">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 p-0.5">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <button onClick={() => navigate('/perfil')} className="w-full h-full flex items-center justify-center hover:cursor-pointer" >

                <span className="text-cyan-600 font-bold text-xs">IG</span>
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-sm text-slate-400">Olá, {currentUser.name}</h2>
            <p className="font-semibold text-cyan-400 text-xs">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2" title="Sair">
          <LogOut size={20} />
        </button>
      </header>

      <main className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto w-full">
        {/* Métricas Resumidas */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          {canSeeVisitors && (
            <div
              onClick={() => navigate('/visitantes')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-center cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs mb-1">Novos Visitantes</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {visitorCount !== null ? visitorCount : '...'}
              </span>
            </div>
          )}
          {canSeeMembers && (
            <div
              onClick={() => navigate('/membros')}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col justify-center cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs mb-1">Membros em GCs</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {memberCount !== null ? memberCount : '...'}
              </span>
            </div>
          )}
          {!canSeeVisitors && !canSeeMembers && (
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-slate-400 text-xs mb-1">Seu Perfil</span>
              <span className="text-lg font-bold text-white">Bem-vindo(a) ao app!</span>
            </div>
          )}
        </section>

        {/* Card Informativo do GC do Membro Logado */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              Seu Grupo de Conexão (GC)
            </h3>
            {currentUser.connectionGroup && (
              <span className="bg-cyan-500/10 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-cyan-500/20">
                GC {currentUser.connectionGroup.name}
              </span>
            )}
          </div>

          {currentUser.connectionGroup ? (
            <div className="space-y-2 text-xs">
              <h4 className="text-base font-bold text-cyan-400">
                GC {currentUser.connectionGroup.name}
              </h4>
              <div className="flex flex-col gap-2 text-slate-300 pt-1">
                {currentUser.connectionGroup.neighborhood && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>Localização: <strong className="text-white">{currentUser.connectionGroup.neighborhood}</strong></span>
                  </div>
                )}
                {(currentUser.connectionGroup.meetingDay || currentUser.connectionGroup.meetingTime) && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Encontro: <strong className="text-white">{currentUser.connectionGroup.meetingDay || ''} {currentUser.connectionGroup.meetingTime ? `às ${currentUser.connectionGroup.meetingTime}` : ''}</strong></span>
                  </div>
                )}
                {currentUser.connectionGroup.leader?.fullName && (
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-slate-400 shrink-0" />
                    <span>Líder do GC: <strong className="text-white">{currentUser.connectionGroup.leader.fullName}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2">
              Você ainda não possui um Grupo de Conexão (GC) vinculado ao seu perfil. Fale com a liderança da sua igreja para se conectar!
            </div>
          )}
        </section>

        {/* Card Informativo dos Cargos & Ministérios do Membro Logado */}
        {currentUser.memberProfile?.ministries && currentUser.memberProfile.ministries.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Briefcase size={18} className="text-blue-400" />
              Seus Cargos & Ministérios
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentUser.memberProfile.ministries.map((m, idx) => (
                <span
                  key={idx}
                  className="bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                >
                  <Briefcase size={12} className="text-blue-400" />
                  {m}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Ações Rápidas</h3>

          <div className="space-y-3">
            {canSeeMetrics && (
              <button
                onClick={() => navigate('/metricas')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                    <BarChart3 size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Métricas & Cultos</h4>
                    <p className="text-xs text-slate-400">Gráficos de visitantes e frequência</p>
                  </div>
                </div>
                <ChevronRight className="text-emerald-500" size={20} />
              </button>
            )}

            {canRegisterVisitors && (
              <button
                onClick={() => navigate('/cadastro/visitantes')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
                    <UserPlus size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Cadastrar Visitante</h4>
                    <p className="text-xs text-slate-400">Adicionar novo no acolhimento</p>
                  </div>
                </div>
                <ChevronRight className="text-cyan-500" size={20} />
              </button>
            )}

            {canSeeVisitors && (
              <button
                onClick={() => navigate('/visitantes')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
                    <Users size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Lista de Visitantes</h4>
                    <p className="text-xs text-slate-400">Ver e gerenciar cadastrados</p>
                  </div>
                </div>
                <ChevronRight className="text-cyan-500" size={20} />
              </button>
            )}

            {canSeeMembers && (
              <button
                onClick={() => navigate('/membros')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <UserCheck size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Membros Oficiais</h4>
                    <p className="text-xs text-slate-400">Gestão da membresia</p>
                  </div>
                </div>
                <ChevronRight className="text-blue-500" size={20} />
              </button>
            )}

            {canManageCargos && (
              <button
                onClick={() => navigate('/cargos')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
                    <Briefcase size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Cargos & Ministérios</h4>
                    <p className="text-xs text-slate-400">Gerenciar cargos da igreja</p>
                  </div>
                </div>
                <ChevronRight className="text-cyan-500" size={20} />
              </button>
            )}

            {canManageGCs && (
              <button
                onClick={() => navigate('/gcs')}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <Users size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Grupos de Conexão (GCs)</h4>
                    <p className="text-xs text-slate-400">Gerenciar IDE, Reobote, Chosen, Rebecas...</p>
                  </div>
                </div>
                <ChevronRight className="text-blue-500" size={20} />
              </button>
            )}

            <button
              onClick={() => navigate('/perfil')}
              className="w-full flex items-center justify-between bg-gradient-to-r from-slate-800/40 to-transparent border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-slate-800 text-slate-300 p-2 rounded-lg">
                  <UserCheck size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white">Meu Perfil</h4>
                  <p className="text-xs text-slate-400">Ver e atualizar meus dados</p>
                </div>
              </div>
              <ChevronRight className="text-slate-500" size={20} />
            </button>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around py-3 px-2 pb-safe z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center gap-1 text-cyan-400">
          <Home size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        {canRegisterVisitors && (
          <button
            onClick={() => navigate('/cadastro/visitantes')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
            <UserPlus size={20} />
            <span className="text-[10px] font-medium">Cadastrar</span>
          </button>
        )}
        {canSeeVisitors && (
          <button
            onClick={() => navigate('/visitantes')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
            <Users size={20} />
            <span className="text-[10px] font-medium">Visitantes</span>
          </button>
        )}
        {canSeeMembers && (
          <button
            onClick={() => navigate('/membros')}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors">
            <UserCheck size={20} />
            <span className="text-[10px] font-medium">Membros</span>
          </button>
        )}
      </nav>
    </div>
  );
}