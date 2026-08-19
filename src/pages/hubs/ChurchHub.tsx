import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UI_MESSAGES } from '../../constants/messages';

export default function ChurchHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const hasRole = (roles: string[]) => isSuperAdmin || userRoles.some(r => roles.includes(r));

  const canManageCargos = hasRole(['WORSHIP_LEADER']);
  const canManageGCs = hasRole(['GC_SUPERVISOR', 'GC_LEADER']);
  const canSeeMetrics = hasRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR', 'WORSHIP_LEADER']);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {UI_MESSAGES.LABELS.HUB_CHURCH_TITLE}
        </h1>
        <p className="text-slate-400 mt-1">{UI_MESSAGES.LABELS.HUB_CHURCH_DESC}</p>
      </header>

      <div className="grid gap-4">
        {canManageGCs && (
          <button
            onClick={() => navigate('/gcs')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <MapPin size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Grupos de Conexão (GCs)</h3>
              <p className="text-xs text-slate-500 mt-1">Gerencie os GCs, líderes e endereços de reuniões.</p>
            </div>
          </button>
        )}

        {canManageCargos && (
          <button
            onClick={() => navigate('/cargos')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Cargos & Ministérios</h3>
              <p className="text-xs text-slate-500 mt-1">Gerencie os ministérios da igreja e as lideranças.</p>
            </div>
          </button>
        )}

        {canSeeMetrics && (
          <button
            onClick={() => navigate('/metricas')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Métricas & Cultos</h3>
              <p className="text-xs text-slate-500 mt-1">Análise de frequência, gráficos e registro de cultos.</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
