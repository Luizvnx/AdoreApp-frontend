import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UI_MESSAGES } from '../../constants/messages';

export default function VisitorsHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const hasRole = (roles: string[]) => isSuperAdmin || userRoles.some(r => roles.includes(r));
  
  const canRegister = hasRole(['ADMIN_WELCOME']);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {UI_MESSAGES.LABELS.HUB_VISITORS_TITLE}
        </h1>
        <p className="text-slate-400 mt-1">{UI_MESSAGES.LABELS.HUB_VISITORS_DESC}</p>
      </header>

      <div className="grid gap-4">
        {canRegister && (
          <button
            onClick={() => navigate('/cadastro/visitantes')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Cadastrar Novo Visitante</h3>
              <p className="text-xs text-slate-500 mt-1">Registrar os dados de uma nova pessoa no acolhimento.</p>
            </div>
          </button>
        )}

        <button
          onClick={() => navigate('/visitantes')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center gap-4 group transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">Ver Lista de Visitantes</h3>
            <p className="text-xs text-slate-500 mt-1">Acompanhamento, conversão para membro e remoção.</p>
          </div>
        </button>
      </div>
    </div>
  );
}
