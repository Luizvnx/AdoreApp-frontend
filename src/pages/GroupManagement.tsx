import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Plus, Trash2, Sparkles, MapPin, Calendar, 
  UserCheck, MessageCircle, Edit2, X, Clock, User
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

export interface LeaderInfo {
  id: string;
  fullName: string;
  email?: string;
  memberProfile?: {
    phone?: string | null;
  } | null;
}

export interface GCMemberItem {
  id: string;
  fullName: string;
  email?: string;
  memberProfile?: {
    phone?: string | null;
  } | null;
}

export interface GCVisitorItem {
  id: string;
  fullName: string;
  phone?: string | null;
  status: string;
}

export interface ConnectionGroupItem {
  id: string;
  name: string;
  neighborhood?: string | null;
  meetingDay?: string | null;
  meetingTime?: string | null;
  leaderId?: string | null;
  leader?: LeaderInfo | null;
  members?: GCMemberItem[];
  visitors?: GCVisitorItem[];
  _count?: {
    members: number;
    visitors: number;
  };
}

export interface MemberOption {
  id: string;
  fullName: string;
  roles: string[];
  memberProfile?: { phone?: string | null };
}

export default function GroupManagement() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [groups, setGroups] = useState<ConnectionGroupItem[]>([]);
  const [availableMembers, setAvailableMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Form de Criação / Edição
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal de Detalhes do GC
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<ConnectionGroupItem | null>(null);

  useEffect(() => {
    fetchGroups();
    fetchMembers();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connection-groups');
      setGroups(response.data);
    } catch (error) {
      showError(UI_MESSAGES.ERRORS.LOAD_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setAvailableMembers(response.data);
    } catch (err) {
      // Carregamento silencioso
    }
  };

  const handleOpenEdit = (group: ConnectionGroupItem) => {
    setEditingGroupId(group.id);
    setName(group.name);
    setNeighborhood(group.neighborhood || '');
    setMeetingDay(group.meetingDay || '');
    setMeetingTime(group.meetingTime || '');
    setLeaderId(group.leaderId || group.leader?.id || '');
    setSelectedGroupDetail(null);
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setName('');
    setNeighborhood('');
    setMeetingDay('');
    setMeetingTime('');
    setLeaderId('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setAdding(true);

      const payload = {
        name: name.trim(),
        neighborhood: neighborhood.trim() || undefined,
        meetingDay: meetingDay.trim() || undefined,
        meetingTime: meetingTime.trim() || undefined,
        leaderId: leaderId || null,
      };

      if (editingGroupId) {
        await api.put(`/connection-groups/${editingGroupId}`, payload);
        showSuccess('Grupo de Conexão (GC) atualizado com sucesso!');
        setEditingGroupId(null);
        fetchGroups();
      } else {
        const res = await api.post('/connection-groups', payload);
        setGroups((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        showSuccess(UI_MESSAGES.SUCCESS.GROUP_CREATED);
      }

      setName('');
      setNeighborhood('');
      setMeetingDay('');
      setMeetingTime('');
      setLeaderId('');
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao salvar Grupo de Conexão.'));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, groupName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o GC "${groupName}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/connection-groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      if (selectedGroupDetail?.id === id) {
        setSelectedGroupDetail(null);
      }
      showSuccess(UI_MESSAGES.SUCCESS.GROUP_DELETED);
    } catch (err: any) {
      showError(UI_MESSAGES.ERRORS.DELETE_GROUP);
    } finally {
      setDeletingId(null);
    }
  };

  const formatWhatsAppUrl = (phone?: string | null) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (!digits) return null;
    const fullPhone = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${fullPhone}`;
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white p-2 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            Grupos de Conexão (GCs)
          </h1>
          <p className="text-xs text-cyan-400">Gestão de GCs da igreja e contatos dos líderes</p>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-lg mx-auto w-full space-y-6">
        {/* Banner Informativo */}
        <div className="bg-slate-900 border border-slate-700 rounded-sm p-4 flex items-start gap-3">
          <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cadastre os Grupos de Conexão (GCs), atribua os líderes com contato e permite que os membros visualizem os detalhes e conversem diretamente com a liderança.
          </p>
        </div>

        {/* Form de Cadastro / Edição de GC */}
        <form
          onSubmit={handleSave}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              {editingGroupId ? (
                <>
                  <Edit2 size={16} className="text-amber-400" />
                  Editar Grupo de Conexão (GC)
                </>
              ) : (
                <>
                  <Plus size={16} className="text-cyan-400" />
                  Criar Novo Grupo de Conexão (GC)
                </>
              )}
            </h2>
            {editingGroupId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-md"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Nome do GC *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: IDE, Reobote, Chosen, Rebecas..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              required
            />
          </div>

          {/* Seleção do Líder do GC */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <User size={14} className="text-cyan-400" /> Líder Responsável pelo GC
            </label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all cursor-pointer"
            >
              <option value="">Nenhum líder atribuído</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.roles.join(', ')})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Bairro / Localização (Opcional)</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Centro, Jardins..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Dia de Encontro</label>
              <input
                type="text"
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
                placeholder="Ex: Terça-feira"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Horário</label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="Ex: 19:30"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {adding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : editingGroupId ? (
              <>
                <Edit2 size={18} />
                Salvar Alterações do GC
              </>
            ) : (
              <>
                <Plus size={18} />
                Cadastrar Grupo de Conexão
              </>
            )}
          </button>
        </form>

        {/* Lista de GCs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Grupos Cadastrados ({groups.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6">
              Nenhum Grupo de Conexão cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((item) => {
                const leaderPhone = item.leader?.memberProfile?.phone;
                const whatsappUrl = formatWhatsAppUrl(leaderPhone);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGroupDetail(item)}
                    className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col gap-3 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                          <Users size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                            GC {item.name}
                          </h4>

                          {/* Líder do GC */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Líder:</span>
                            {item.leader ? (
                              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                                {item.leader.fullName}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Não atribuído</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                            {item.neighborhood && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-slate-500" />
                                {item.neighborhood}
                              </span>
                            )}
                            {(item.meetingDay || item.meetingTime) && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-slate-500" />
                                {item.meetingDay || ''} {item.meetingTime ? `às ${item.meetingTime}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão de WhatsApp se tiver telefone do líder */}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 p-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 text-xs font-semibold shadow"
                          title="Falar com o líder no WhatsApp"
                        >
                          <MessageCircle size={15} />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Rodapé do Card com Contadores e Ações */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-3">
                        <span className="text-cyan-400 font-semibold">
                          {item._count?.members || 0} membro(s)
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">
                          {item._count?.visitors || 0} visitante(s)
                        </span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="Editar GC"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id, item.name);
                          }}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir GC"
                        >
                          {deletingId === item.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Detalhes do GC (Visualizar Informações Completas) */}
      {selectedGroupDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">GC {selectedGroupDetail.name}</h2>
                  <p className="text-xs text-slate-400">Informações detalhadas e membros</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedGroupDetail(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Informações Básicas do GC */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              {/* Líder Responsável */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Líder do GC</span>
                  <span className="text-sm font-bold text-white">
                    {selectedGroupDetail.leader ? selectedGroupDetail.leader.fullName : 'Não atribuído'}
                  </span>
                  {selectedGroupDetail.leader?.memberProfile?.phone && (
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Tel: {selectedGroupDetail.leader.memberProfile.phone}
                    </span>
                  )}
                </div>

                {formatWhatsAppUrl(selectedGroupDetail.leader?.memberProfile?.phone) && (
                  <a
                    href={formatWhatsAppUrl(selectedGroupDetail.leader?.memberProfile?.phone)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <MessageCircle size={16} />
                    Falar no WhatsApp
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Bairro / Local</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-cyan-400 shrink-0" />
                    {selectedGroupDetail.neighborhood || 'Não informado'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Encontro</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1 mt-0.5">
                    <Clock size={13} className="text-cyan-400 shrink-0" />
                    {selectedGroupDetail.meetingDay || 'Não def.'} {selectedGroupDetail.meetingTime ? `às ${selectedGroupDetail.meetingTime}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de Membros Vinculados */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-cyan-400" />
                Membros Oficiais Vinculados ({selectedGroupDetail.members?.length || selectedGroupDetail._count?.members || 0})
              </h4>

              {selectedGroupDetail.members && selectedGroupDetail.members.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedGroupDetail.members.map((m) => (
                    <div key={m.id} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{m.fullName}</span>
                      {m.memberProfile?.phone && (
                        <span className="text-slate-400 text-[11px]">{m.memberProfile.phone}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                  Nenhum membro oficial vinculado a este GC ainda.
                </p>
              )}
            </div>

            {/* Lista de Visitantes Vinculados */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={14} className="text-cyan-400" />
                Visitantes em Frequência ({selectedGroupDetail.visitors?.length || selectedGroupDetail._count?.visitors || 0})
              </h4>

              {selectedGroupDetail.visitors && selectedGroupDetail.visitors.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedGroupDetail.visitors.map((v) => (
                    <div key={v.id} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{v.fullName}</span>
                        <span className="text-[10px] text-cyan-400 font-medium">{v.status}</span>
                      </div>
                      {v.phone && (
                        <span className="text-slate-400 text-[11px]">{v.phone}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                  Nenhum visitante registrado neste GC ainda.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedGroupDetail)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Edit2 size={14} /> Editar GC
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroupDetail(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
