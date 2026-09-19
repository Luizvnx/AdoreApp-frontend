import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Users,
  UserCheck,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Settings,
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatWhatsAppUrl } from '../utils/phoneUtils';
import { useCongregation } from '../context/CongregationContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const { selectedCongregationId } = useCongregation();

  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

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
        api.get(`/visitors?congregationId=${selectedCongregationId}`)
          .then(res => setVisitorCount(res.data.length))
          .catch(err => {
            if (err.response?.status !== 401) showError('Erro ao buscar visitantes.');
          })
      );
    }

    if (canSeeMembers) {
      fetchPromises.push(
        api.get(`/members?congregationId=${selectedCongregationId}`)
          .then(res => setMemberCount(res.data.length))
          .catch(err => {
            if (err.response?.status !== 401) showError('Erro ao buscar membros.');
          })
      );
    }

    Promise.all(fetchPromises).finally(() => setLoadingMetrics(false));
  }, [canSeeVisitors, canSeeMembers, user, selectedCongregationId, showError]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">

      {/* Welcome Banner */}
      <header className="bg-slate-900 border border-slate-700 p-6 rounded-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mb-1">
            Olá, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-cyan-400 font-medium mb-3">{currentUser.role.replace('_', ' ')}</p>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Bem-vindo ao AdorehApp. Acesse rapidamente os dados mais importantes da igreja logo abaixo, ou use o menu de navegação.
          </p>
        </div>
      </header>

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
        {(() => {
          const gc = currentUser.connectionGroup;
          const leaderPhone = gc?.leader?.memberProfile?.phone;
          const leaderWhatsApp = formatWhatsAppUrl(leaderPhone);
          const isLeaderOfThisGC = gc && (gc.leaderId === currentUser.id || gc.leader?.id === currentUser.id);
          const canManageThisGC = hasAnyRole(['SUPER_ADMIN', 'PASTOR', 'DIRECTOR', 'GC_SUPERVISOR']) || isLeaderOfThisGC;

          return (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                    <HeartHandshake size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    Seu Grupo de Conexão (GC)
                  </h3>
                </div>
                {gc && (
                  <span className="bg-cyan-500/10 text-cyan-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border border-cyan-500/20">
                    Membro Ativo
                  </span>
                )}
              </div>

              {gc ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tight">
                        GC {gc.name}
                      </h4>
                      {canManageThisGC && (
                        <button
                          onClick={() => navigate(`/gcs/gerenciar?id=${gc.id}`)}
                          className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                          title="Gerenciar este GC"
                        >
                          <Settings size={13} />
                          Gerenciar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    {/* Horário e Dia de Encontro */}
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-2.5">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Clock size={15} />
                        <span className="text-[11px] uppercase tracking-wider font-bold">
                          Horário e Dia de Encontro
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/50 flex items-center gap-2.5">
                          <div className="bg-slate-800 p-1.5 rounded-md text-cyan-400">
                            <Calendar size={15} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                              Dia da Semana
                            </span>
                            <span className="font-bold text-slate-100 text-xs sm:text-sm truncate block">
                              {gc.meetingDay || 'A definir'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/50 flex items-center gap-2.5">
                          <div className="bg-slate-800 p-1.5 rounded-md text-emerald-400">
                            <Clock size={15} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">
                              Horário
                            </span>
                            <span className="font-bold text-emerald-300 text-xs sm:text-sm truncate block">
                              {gc.meetingTime ? `${gc.meetingTime}` : 'A definir'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Local do Encontro */}
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <MapPin size={15} />
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            Local de Encontro
                          </span>
                        </div>
                        {gc.zipCode && (
                          <span className="text-[10px] bg-slate-900 border border-slate-700/80 text-cyan-300 px-2 py-0.5 rounded-md font-mono">
                            CEP {gc.zipCode}
                          </span>
                        )}
                      </div>

                      {gc.address || gc.neighborhood ? (
                        <div className="space-y-2.5">
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/40">
                            {gc.address ? (
                              <p className="text-slate-100 font-semibold text-xs sm:text-sm leading-relaxed">
                                {gc.address}{gc.addressNumber ? `, Nº ${gc.addressNumber}` : ''}
                              </p>
                            ) : (
                              <p className="text-slate-400 italic text-xs">Endereço da casa a ser confirmado</p>
                            )}
                            {gc.neighborhood && (
                              <p className="text-slate-400 text-[11px] mt-0.5">
                                Bairro: <span className="text-slate-300 font-medium">{gc.neighborhood}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const fullLoc = [
                                  gc.address ? `${gc.address}${gc.addressNumber ? `, Nº ${gc.addressNumber}` : ''}` : null,
                                  gc.neighborhood ? `Bairro ${gc.neighborhood}` : null,
                                  gc.zipCode ? `CEP ${gc.zipCode}` : null
                                ].filter(Boolean).join(', ');
                                handleCopyAddress(fullLoc || gc.address || gc.neighborhood || '');
                              }}
                              className="text-[11px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                            >
                              {copiedAddress ? (
                                <>
                                  <Check size={12} className="text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Endereço Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copiar Endereço</span>
                                </>
                              )}
                            </button>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                [
                                  gc.address ? `${gc.address}${gc.addressNumber ? ` ${gc.addressNumber}` : ''}` : null,
                                  gc.neighborhood,
                                  gc.zipCode
                                ].filter(Boolean).join(', ')
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] bg-cyan-950/40 hover:bg-cyan-900/50 active:scale-95 border border-cyan-800/50 text-cyan-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-medium"
                            >
                              <ExternalLink size={12} />
                              <span>Abrir no Google Maps</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40 italic flex items-center gap-2">
                          <MapPin size={13} className="text-slate-500 shrink-0" />
                          <span>Local a ser combinado diretamente com a liderança do grupo.</span>
                        </div>
                      )}
                    </div>

                    {/* Líder Responsável com Botão Direto de WhatsApp */}
                    {gc.leader && (
                      <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-800 p-2 rounded-lg text-amber-400">
                            <UserCheck size={16} />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                              Líder do GC
                            </span>
                            <span className="font-bold text-slate-200 text-sm">
                              {gc.leader.fullName}
                            </span>
                          </div>
                        </div>

                        {leaderWhatsApp && (
                          <a
                            href={leaderWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                            title="Conversar com o líder no WhatsApp"
                          >
                            <MessageCircle size={15} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Irmãos que fazem parte do mesmo GC */}
                    {gc.members && gc.members.length > 0 && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block flex items-center gap-1.5">
                          <Users size={12} className="text-cyan-400" />
                          Irmãos do seu GC ({gc.members.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {gc.members.slice(0, 6).map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1.5 text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                              {m.fullName.split(' ')[0]}
                            </span>
                          ))}
                          {gc.members.length > 6 && (
                            <span className="text-[10px] text-slate-500 self-center pl-1">
                              +{gc.members.length - 6} outros
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 bg-slate-950/50 p-5 rounded-xl border border-slate-800/50 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-full">
                    <HeartHandshake size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Você ainda não possui um GC vinculado</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Participe de um Grupo de Conexão para viver comunhão, oração e amizade nas casas!
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/hub/gc')}
                    className="mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Conhecer Grupos de Conexão</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </section>
          );
        })()}

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