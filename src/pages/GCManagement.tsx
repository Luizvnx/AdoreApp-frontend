import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Settings,
  MapPin,
  Calendar,
  Clock,
  UserPlus,
  UserMinus,
  MessageCircle,
  Search,
  Check,
  X,
  Save,
  ShieldCheck,
  UserCheck,
  Hash
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/messageHandler';
import { formatWhatsAppUrl } from '../utils/phoneUtils';
import { WEEKDAY_OPTIONS, fetchAddressByCep, formatCep } from '../utils/cepUtils';

interface GCMember {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string | null;
  memberProfile?: {
    phone?: string | null;
    avatarUrl?: string | null;
  } | null;
}

interface GCVisitor {
  id: string;
  fullName: string;
  phone?: string | null;
  status: string;
}

interface ConnectionGroupDetail {
  id: string;
  name: string;
  neighborhood?: string | null;
  zipCode?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  meetingDay?: string | null;
  meetingTime?: string | null;
  leaderId?: string | null;
  congregationId?: string | null;
  leader?: {
    id: string;
    fullName: string;
    email?: string;
    memberProfile?: { phone?: string | null } | null;
  } | null;
  members: GCMember[];
  visitors: GCVisitor[];
  _count?: {
    members: number;
    visitors: number;
  };
}

interface ChurchMemberOption {
  id: string;
  fullName: string;
  roles: string[];
  connectionGroupId?: string | null;
  memberProfile?: { phone?: string | null };
}

export default function GCManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isPastor = userRoles.includes('PASTOR');
  const isSupervisor = userRoles.includes('GC_SUPERVISOR');
  const isLeader = userRoles.includes('GC_LEADER');
  const isAdminOrSupervisor = isSuperAdmin || isPastor || isSupervisor;

  // Estados de lista e seleção de GC
  const [groups, setGroups] = useState<ConnectionGroupDetail[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<ConnectionGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulário de Configurações
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);

  // Membros da igreja para atribuição de líder e adição
  const [allMembers, setAllMembers] = useState<ChurchMemberOption[]>([]);

  // Modal de Adicionar Membro
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [addingMemberId, setAddingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // 1. Carrega todos os GCs e lista de membros
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [groupsRes, membersRes] = await Promise.all([
        api.get('/connection-groups'),
        api.get('/members').catch(() => ({ data: [] })),
      ]);

      const loadedGroups: ConnectionGroupDetail[] = groupsRes.data || [];
      setGroups(loadedGroups);
      setAllMembers(membersRes.data || []);

      // Seleção inicial do GC
      const queryGroupId = searchParams.get('id');
      let targetGroup: ConnectionGroupDetail | undefined;

      if (queryGroupId) {
        targetGroup = loadedGroups.find((g) => g.id === queryGroupId);
      }

      // Se for apenas líder de GC, prioriza o GC que ele lidera
      if (!targetGroup && !isAdminOrSupervisor && isLeader) {
        targetGroup = loadedGroups.find((g) => g.leaderId === user?.id || g.leader?.id === user?.id);
      }

      if (!targetGroup && loadedGroups.length > 0) {
        targetGroup = loadedGroups[0];
      }

      if (targetGroup) {
        selectGroup(targetGroup);
      }
    } catch (error) {
      showError('Erro ao carregar dados dos Grupos de Conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Popula o formulário ao trocar o GC selecionado
  const selectGroup = (group: ConnectionGroupDetail) => {
    setSelectedGroupId(group.id);
    setSelectedGroup(group);
    setName(group.name || '');
    setNeighborhood(group.neighborhood || '');
    setZipCode(group.zipCode ? formatCep(group.zipCode) : '');
    setAddress(group.address || '');
    setAddressNumber(group.addressNumber || '');
    setMeetingDay(group.meetingDay || '');
    setMeetingTime(group.meetingTime || '');
    setLeaderId(group.leaderId || group.leader?.id || '');
    setCepFeedback(null);
  };

  // Consulta endereço a partir do CEP via ViaCEP
  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setZipCode(formatted);
    setCepFeedback(null);

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      try {
        setLoadingCep(true);
        const data = await fetchAddressByCep(clean);
        if (data) {
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.logradouro) {
            setAddress(data.logradouro);
          }
          setCepFeedback(`${data.localidade} - ${data.uf}`);
          showSuccess(`Endereço localizado: ${data.localidade}/${data.uf}`);
        } else {
          showError('CEP não encontrado na base dos Correios.');
        }
      } catch {
        showError('Erro ao consultar CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleGroupChange = (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (group) {
      selectGroup(group);
    }
  };

  // Recarregar dados do GC selecionado
  const refreshCurrentGroup = async (groupId: string) => {
    try {
      const res = await api.get(`/connection-groups/${groupId}`);
      const updated = res.data;
      setSelectedGroup(updated);
      setGroups((prev) => prev.map((g) => (g.id === groupId ? updated : g)));
    } catch {
      // Falha silenciosa
    }
  };

  // Salvar Configurações do GC
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        neighborhood: neighborhood.trim() || null,
        zipCode: zipCode.trim() || null,
        address: address.trim() || null,
        addressNumber: addressNumber.trim() || null,
        meetingDay: meetingDay.trim() || null,
        meetingTime: meetingTime.trim() || null,
        ...(isAdminOrSupervisor ? { leaderId: leaderId || null } : {}),
      };

      const res = await api.put(`/connection-groups/${selectedGroupId}`, payload);
      showSuccess('Configurações do GC atualizadas com sucesso!');
      const updatedGroup = res.data;
      setSelectedGroup(updatedGroup);
      setGroups((prev) => prev.map((g) => (g.id === selectedGroupId ? updatedGroup : g)));
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao salvar alterações do GC.'));
    } finally {
      setSaving(false);
    }
  };

  // Adicionar Membro ao GC
  const handleAddMember = async (userId: string) => {
    if (!selectedGroupId) return;

    try {
      setAddingMemberId(userId);
      await api.post(`/connection-groups/${selectedGroupId}/members`, { userId });
      showSuccess('Membro adicionado ao GC com sucesso!');
      await refreshCurrentGroup(selectedGroupId);
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao adicionar membro ao GC.'));
    } finally {
      setAddingMemberId(null);
    }
  };

  // Remover Membro do GC
  const handleRemoveMember = async (member: GCMember) => {
    if (!selectedGroupId) return;
    const confirm = window.confirm(
      `Deseja desvincular o membro "${member.fullName}" deste Grupo de Conexão?`
    );
    if (!confirm) return;

    try {
      setRemovingMemberId(member.id);
      await api.delete(`/connection-groups/${selectedGroupId}/members/${member.id}`);
      showSuccess(`Membro ${member.fullName} removido do GC.`);
      await refreshCurrentGroup(selectedGroupId);
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao remover membro do GC.'));
    } finally {
      setRemovingMemberId(null);
    }
  };

  // Lista de membros disponíveis para adicionar (que não estão neste GC)
  const availableToAdd = useMemo(() => {
    const currentMemberIds = new Set(selectedGroup?.members.map((m) => m.id) || []);
    return allMembers
      .filter((m) => !currentMemberIds.has(m.id))
      .filter((m) =>
        memberSearch.trim()
          ? m.fullName.toLowerCase().includes(memberSearch.toLowerCase())
          : true
      );
  }, [allMembers, selectedGroup, memberSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Carregando painel do GC...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      {/* Header com Navegação */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hub/gc')}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-amber-400" />
              Gerenciar Grupo de Conexão
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Atualize configurações, endereço, dias de encontro e faça a gestão de membros
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Seletor de GC para Liderança / Admins */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Selecione o GC para Gerenciar
              </label>
              <p className="text-xs text-slate-500">
                {isAdminOrSupervisor
                  ? 'Como Administrador/Supervisor, você pode gerenciar qualquer GC da congregação.'
                  : 'Você está visualizando o GC sob sua liderança.'}
              </p>
            </div>

            <div className="sm:w-72">
              <select
                value={selectedGroupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    GC {g.name} {g.leader ? `(${g.leader.fullName})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {!selectedGroup ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            Nenhum Grupo de Conexão disponível para gerenciamento.
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Coluna 1: Formulário de Configurações (2 Colunas no Grid) */}
            <div className="lg:col-span-2 space-y-6">
              <form
                onSubmit={handleSaveSettings}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings size={18} className="text-amber-400" />
                    Configurações do GC {selectedGroup.name}
                  </h2>
                  <span className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                    Edição Ativa
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Nome do GC *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: IDE, Reobote, Ebenézer..."
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  {isAdminOrSupervisor && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-amber-400" /> Líder Responsável
                      </label>
                      <select
                        value={leaderId}
                        onChange={(e) => setLeaderId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none cursor-pointer"
                      >
                        <option value="">Nenhum líder atribuído</option>
                        {allMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName} {m.roles?.length ? `(${m.roles.join(', ')})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Campo de CEP com busca automática */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin size={14} className="text-amber-400" /> CEP do Local
                      </label>
                      {cepFeedback && (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          ✓ {cepFeedback}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => handleCepChange(e.target.value)}
                        placeholder="00000-000 (preenche rua e bairro automaticamente)"
                        maxLength={9}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition-colors pr-10 font-mono"
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-3 w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin size={14} className="text-emerald-400" /> Rua / Logradouro
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Preenchido via CEP ou digite o logradouro..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Hash size={14} className="text-amber-400" /> Número da Casa
                    </label>
                    <input
                      type="text"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="Ex: 123, 45-B ou S/N"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin size={14} className="text-cyan-400" /> Bairro / Região
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Preenchido via CEP ou digite aqui..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  {/* Dia de Encontro (Seleção Padronizada) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar size={14} className="text-cyan-400" /> Dia de Encontro *
                    </label>
                    <select
                      value={meetingDay}
                      onChange={(e) => setMeetingDay(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="">Selecione o dia da semana</option>
                      {WEEKDAY_OPTIONS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock size={14} className="text-cyan-400" /> Horário de Início
                    </label>
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      placeholder="Ex: 19:30 ou 20:00"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar Configurações do GC
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Seção de Visitantes Frequentes */}
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={16} className="text-cyan-400" />
                    Visitantes Frequentes do GC ({selectedGroup.visitors?.length || 0})
                  </h3>
                </div>

                {selectedGroup.visitors && selectedGroup.visitors.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {selectedGroup.visitors.map((v) => (
                      <div
                        key={v.id}
                        className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white block">{v.fullName}</span>
                          <span className="text-[10px] text-cyan-400">{v.status}</span>
                        </div>
                        {v.phone && (
                          <a
                            href={formatWhatsAppUrl(v.phone) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 p-1.5 bg-emerald-500/10 rounded-lg"
                            title="Falar no WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/30 rounded-xl">
                    Nenhum visitante registrado com frequência neste GC no momento.
                  </p>
                )}
              </section>
            </div>

            {/* Coluna 2: Gestão de Membros Participantes */}
            <div className="space-y-4">
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users size={18} className="text-cyan-400" />
                      Membros do GC
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedGroup.members?.length || 0} membro(s) vinculados
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMemberSearch('');
                      setShowAddMemberModal(true);
                    }}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <UserPlus size={14} />
                    Adicionar
                  </button>
                </div>

                {/* Lista de Membros */}
                {selectedGroup.members && selectedGroup.members.length > 0 ? (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {selectedGroup.members.map((m) => {
                      const isGCLeader = m.id === selectedGroup.leaderId;
                      const phone = m.memberProfile?.phone;
                      const isRemoving = removingMemberId === m.id;

                      return (
                        <div
                          key={m.id}
                          className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 border border-slate-700">
                              {m.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                {m.fullName}
                                {isGCLeader && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold shrink-0">
                                    Líder
                                  </span>
                                )}
                              </p>
                              {phone && (
                                <p className="text-[11px] text-slate-400 truncate">{phone}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {phone && formatWhatsAppUrl(phone) && (
                              <a
                                href={formatWhatsAppUrl(phone)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Falar no WhatsApp"
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m)}
                              disabled={isRemoving}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Remover membro do GC"
                            >
                              {isRemoving ? (
                                <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <UserMinus size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                    <Users size={24} className="mx-auto text-slate-600" />
                    <p className="text-xs text-slate-400">Nenhum membro vinculado a este GC ainda.</p>
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(true)}
                      className="text-xs text-cyan-400 hover:underline font-semibold"
                    >
                      + Clique aqui para adicionar membros
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Adicionar Membro */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Adicionar Membro ao GC</h3>
                  <p className="text-xs text-slate-400">GC {selectedGroup?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Busca de Membros */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Buscar membro pelo nome..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            {/* Lista com Membros Disponíveis */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px]">
              {availableToAdd.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  {memberSearch ? 'Nenhum membro encontrado com esse nome.' : 'Nenhum membro disponível para adicionar.'}
                </div>
              ) : (
                availableToAdd.map((m) => {
                  const isAdding = addingMemberId === m.id;
                  const alreadyInAnotherGC = !!m.connectionGroupId;

                  return (
                    <div
                      key={m.id}
                      className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-white block truncate">{m.fullName}</span>
                        {alreadyInAnotherGC && (
                          <span className="text-[10px] text-amber-400 block">
                            (Já está em outro GC • Será transferido)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddMember(m.id)}
                        disabled={isAdding}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {isAdding ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Check size={13} />
                            Adicionar
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
