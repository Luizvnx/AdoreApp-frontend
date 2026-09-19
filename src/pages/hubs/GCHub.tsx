import { useNavigate } from 'react-router-dom';
import { Users, Settings, ArrowLeft, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function GCHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const hasRole = (roles: string[]) => isSuperAdmin || userRoles.some((r) => roles.includes(r));

  // Apenas admins, super_admins e líderes de GC têm permissão de gerenciamento
  const canManageGC = hasRole(['SUPER_ADMIN', 'PASTOR', 'DIRECTOR', 'GC_SUPERVISOR', 'GC_LEADER']);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Voltar ao início"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <HeartHandshake size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Grupos de Conexão (GCs)
            </h1>
            <p className="text-xs text-slate-400">Comunhão, discipulado e crescimento nas casas</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {/* Opção 1: Visualizar Grupos de Conexão (Para todos os membros) */}
        <button
          onClick={() => navigate('/gcs')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all text-left shadow-lg hover:shadow-cyan-500/5 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                Grupos de Conexão da Igreja
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                Geral
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Consulte os GCs cadastrados, bairros, dias e horários de encontro e contato dos líderes.
            </p>
          </div>
        </button>

        {/* Opção 2: Gerenciar GC (Apenas Admins, Super Admins e Líderes de GC) */}
        {canManageGC && (
          <button
            onClick={() => navigate('/gcs/gerenciar')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all text-left shadow-lg hover:shadow-amber-500/5 cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              <Settings size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                  Gerenciar GC
                </h3>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} /> Liderança
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Atualize configurações de endereço, dia de encontro, horários e faça a gestão completa de membros (adicionar e remover).
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Dica de acolhimento se for membro sem permissão de gestão */}
      {!canManageGC && (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
          <MapPin size={18} className="text-cyan-400 shrink-0" />
          <span>Quer participar de um GC ou se conectar a uma família da igreja? Escolha um grupo acima e fale diretamente com o líder!</span>
        </div>
      )}
    </div>
  );
}
