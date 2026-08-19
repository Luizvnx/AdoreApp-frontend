import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, UserCheck, Briefcase, Wallet, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UI_MESSAGES } from '../../constants/messages';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const hasAnyRole = (roles: string[]) => {
    if (isSuperAdmin) return true;
    return userRoles.some(r => roles.includes(r));
  };

  const canSeeVisitors = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR']);
  const canSeeMembers = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR']);
  const canSeeChurchHub = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR', 'WORSHIP_LEADER']);
  const canSeeFinance = hasAnyRole(['FINANCE_ADMIN']);

  const navItems = [
    {
      id: 'home',
      label: UI_MESSAGES.LABELS.NAV_HOME,
      icon: <Home size={20} />,
      path: '/dashboard',
      show: true,
    },
    {
      id: 'gestao',
      label: UI_MESSAGES.LABELS.NAV_GESTAO,
      icon: <ShieldCheck size={20} />,
      path: '/gestao',
      show: isSuperAdmin, // Apenas Pastor/SuperAdmin
    },
    {
      id: 'visitors',
      label: UI_MESSAGES.LABELS.NAV_VISITORS,
      icon: <UserCheck size={20} />,
      path: '/hub/visitantes',
      show: canSeeVisitors,
    },
    {
      id: 'members',
      label: UI_MESSAGES.LABELS.NAV_MEMBERS,
      icon: <Users size={20} />,
      path: '/hub/membros',
      show: canSeeMembers,
    },
    {
      id: 'church',
      label: UI_MESSAGES.LABELS.NAV_CHURCH,
      icon: <Briefcase size={20} />,
      path: '/hub/igreja',
      show: canSeeChurchHub,
    },
    {
      id: 'finance',
      label: UI_MESSAGES.LABELS.NAV_FINANCE,
      icon: <Wallet size={20} />,
      path: '/financeiro',
      show: canSeeFinance,
    },
    {
      id: 'profile',
      label: UI_MESSAGES.LABELS.NAV_PROFILE,
      icon: <Settings size={20} />,
      path: '/perfil',
      show: true,
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            AvivaApp
          </h1>
          <p className="text-xs text-slate-400 mt-1">Olá, {user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path || (location.pathname.startsWith('/' + item.id) && item.id !== 'home')
                  ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-20 md:pb-0 relative">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-50">
        {/* Usamos overflow-x-auto com hide-scrollbar para caber mais ícones deslizando */}
        <div className="flex items-center px-2 py-2 overflow-x-auto no-scrollbar justify-start sm:justify-around space-x-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/' + item.id) && item.id !== 'home');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-[72px] p-2 rounded-xl transition-all duration-300 relative ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-1 font-medium tracking-wide truncate w-full text-center">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
