import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, LogOut, ChevronRight, Users, UserCheck } from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentUser: User = user || {
    id: '123',
    name: 'Membro',
    role: 'MEMBER',
  };

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  // Lógica de RBAC (Role-Based Access Control)
  const canSeeVisitors = ['SUPER_ADMIN', 'ADMIN_WELCOME', 'GC_LEADER'].includes(currentUser.role);
  const canSeeMembers = ['SUPER_ADMIN', 'GC_LEADER', 'ADMIN_WELCOME'].includes(currentUser.role);

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
              <span className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">24</span>
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
              <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">142</span>
            </div>
          )}
          {!canSeeVisitors && !canSeeMembers && (
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-slate-400 text-xs mb-1">Seu Perfil</span>
              <span className="text-lg font-bold text-white">Bem-vindo(a) ao app!</span>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Ações Rápidas</h3>

          <div className="space-y-3">
            {canSeeVisitors && (
              <>
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
              </>
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

            {currentUser.role === 'MEMBER' && (
              <button
                onClick={() => navigate(`/membros/${currentUser.id}`)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 hover:border-blue-500/50 p-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <UserCheck size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">Meu Perfil</h4>
                    <p className="text-xs text-slate-400">Ver e atualizar meus dados</p>
                  </div>
                </div>
                <ChevronRight className="text-blue-500" size={20} />
              </button>
            )}
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
        {canSeeVisitors && (
          <>
            <button
              onClick={() => navigate('/cadastro/visitantes')}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
              <UserPlus size={20} />
              <span className="text-[10px] font-medium">Cadastrar</span>
            </button>
            <button
              onClick={() => navigate('/visitantes')}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
              <Users size={20} />
              <span className="text-[10px] font-medium">Visitantes</span>
            </button>
          </>
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