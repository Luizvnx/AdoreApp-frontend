import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, UserCheck, Briefcase, Wallet, Settings, ShieldCheck, Building, Building2, MoreHorizontal, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UI_MESSAGES } from '../../constants/messages';
import { useCongregation } from '../../context/CongregationContext';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { congregations, selectedCongregationId, setSelectedCongregationId, currentCongregationName } = useCongregation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const hasAnyRole = (roles: string[]) => {
    if (isSuperAdmin) return true;
    return userRoles.some(r => roles.includes(r));
  };

  const canSeeVisitors = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR', 'PASTOR', 'DIRECTOR']);
  const canSeeMembers = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR', 'PASTOR', 'DIRECTOR']);
  const canSeeChurchHub = hasAnyRole(['ADMIN_WELCOME', 'GC_LEADER', 'GC_SUPERVISOR', 'WORSHIP_LEADER', 'PASTOR', 'DIRECTOR']);
  const canSeeFinance = hasAnyRole(['FINANCE_ADMIN', 'PASTOR', 'DIRECTOR']);

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
      show: isSuperAdmin,
    },
    {
      id: 'church',
      label: UI_MESSAGES.LABELS.NAV_CHURCH,
      icon: <Briefcase size={20} />,
      path: '/hub/igreja',
      show: canSeeChurchHub,
    },
    {
      id: 'congregations',
      label: 'Filiais',
      icon: <Building2 size={20} />,
      path: '/congregacoes',
      show: isSuperAdmin,
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
      id: 'finance',
      label: UI_MESSAGES.LABELS.NAV_FINANCE,
      icon: <Wallet size={20} />,
      path: '/financeiro',
      show: canSeeFinance,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      path: '/whatsapp',
      show: canSeeVisitors,
    },
    {
      id: 'profile',
      label: UI_MESSAGES.LABELS.NAV_PROFILE,
      icon: <Settings size={20} />,
      path: '/perfil',
      show: true,
    }
  ].filter(item => item.show);

  // Seleção de itens exibidos na barra inferior mobile (Máximo 4 + Botão "Mais")
  const useMoreDrawer = navItems.length > 5;
  const mainMobileItems = useMoreDrawer ? navItems.slice(0, 4) : navItems;
  const isAnyDrawerItemActive = useMoreDrawer && navItems.slice(4).some(
    item => location.pathname === item.path || (location.pathname.startsWith('/' + item.id) && item.id !== 'home')
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <img src="/apple-touch-icon.png" alt="AvivaApp Logo" className="w-9 h-9 rounded-full object-cover bg-slate-950 p-0.5 border border-cyan-500/30 shadow-md shrink-0" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              AvivaApp
            </h1>
            <p className="text-xs text-slate-400">Olá, {user?.name}</p>
          </div>
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
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-20 md:pb-0 relative flex flex-col">
        {/* Barra Superior Elegante com Seletor de Congregação */}
        <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-2.5 sm:px-6 pt-safe pb-2.5 flex items-center justify-between font-sans sticky top-0 z-40 shadow-lg">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <div className="p-1 sm:p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 shrink-0">
              <Building size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-medium block leading-none mb-0.5 whitespace-nowrap">
                Congregação Ativa
              </span>
              <span className="text-[11px] sm:text-sm font-bold text-white tracking-tight block truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                {currentCongregationName}
              </span>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              <Building2 size={14} className="text-slate-400 hidden sm:block shrink-0" />
              <select
                value={selectedCongregationId}
                onChange={(e) => setSelectedCongregationId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-cyan-400 font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer shadow-inner max-w-[115px] xs:max-w-[145px] sm:max-w-[220px] truncate"
              >
                <option value="ALL">Visão Global</option>
                {congregations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isHeadquarter ? '(Sede)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-40">
        <div className={`grid ${useMoreDrawer ? 'grid-cols-5' : `grid-cols-${navItems.length}`} items-center px-1 py-1.5`}>
          {mainMobileItems.map(item => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/' + item.id) && item.id !== 'home');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-1 font-medium tracking-wide truncate w-full text-center">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0.5 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}

          {useMoreDrawer && (
            <button
              onClick={() => setShowMoreMenu(true)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${isAnyDrawerItemActive || showMoreMenu ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <div className={`transition-transform duration-300 ${isAnyDrawerItemActive ? '-translate-y-0.5' : ''}`}>
                <MoreHorizontal size={20} />
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-wide truncate w-full text-center">
                Mais
              </span>
              {isAnyDrawerItemActive && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Drawer Bottom Sheet "Mais" para Mobile */}
      {showMoreMenu && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MoreHorizontal size={18} className="text-cyan-400" /> Menu de Navegação
              </h3>
              <button onClick={() => setShowMoreMenu(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path || (location.pathname.startsWith('/' + item.id) && item.id !== 'home');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMoreMenu(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${isActive
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
