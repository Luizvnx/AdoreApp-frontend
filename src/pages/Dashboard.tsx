import { useNavigate } from 'react-router-dom';
import { UserPlus, Home, LogOut, ChevronRight } from 'lucide-react';
import type { User } from '../types'; // Importando nossa tipagem como type-only

export default function Dashboard() {
  const navigate = useNavigate();

  // Carrega usuário salvo no localStorage ou usa mock padrão
  const savedUser = localStorage.getItem('currentUser');
  const currentUser: User = savedUser ? JSON.parse(savedUser) : {
    id: '123',
    name: 'Pr. João',
    role: 'SUPER_ADMIN',
  };

  const handleLogout = (): void => {
    // Lógica de limpar token viria aqui
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 p-0.5">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span className="text-cyan-600 font-bold text-xs">IG</span>
            </div>
          </div>
          <div>
            <h2 className="text-sm text-slate-400">Olá, {currentUser.name}</h2>
            <p className="font-semibold text-cyan-400 text-xs">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white">
          <LogOut size={20} />
        </button>
      </header>

      {/* ... (O restante do layout do Dashboard permanece idêntico ao anterior, 
           o Tailwind lida com a estilização da mesma forma em .jsx ou .tsx) ... */}

      <main className="p-6 space-y-6">
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-slate-400 text-xs mb-1">Novos Visitantes</span>
            <span className="text-2xl font-bold text-white">24</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-slate-400 text-xs mb-1">Membros em GCs</span>
            <span className="text-2xl font-bold text-white">142</span>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Ações Rápidas</h3>
          <div className="space-y-3">
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
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex items-center justify-around py-3 px-2 pb-safe">
        {/* Ícones do menu inferior */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center gap-1 text-cyan-400">
          <Home size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button
          onClick={() => navigate('/cadastro/visitantes')}
          className="flex flex-col items-center gap-1 text-cyan-400">
          <UserPlus size={20} />
          <span className="text-[10px] font-medium">Cadastrar</span>
        </button>
      </nav>
    </div>
  );
}