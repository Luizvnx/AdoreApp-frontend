import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function MembersHub() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Gestão de Membros
        </h1>
        <p className="text-slate-400 mt-1">Gerencie os membros da igreja e atualize seus cadastros.</p>
      </header>

      <div className="grid gap-4">
        <button
          onClick={() => navigate('/membros')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Lista de Membros Oficiais</h3>
            <p className="text-xs text-slate-500 mt-1">Consulte todos os membros cadastrados na congregação.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
