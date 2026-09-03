import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Briefcase, Users, Plus, X, UserPlus, Church, Eye, Edit3, Trash2 } from 'lucide-react';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';
import { maskPhoneNumber } from '../utils/phoneUtils';

interface Member {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    connectionGroup?: {
        id: string;
        name: string;
    } | null;
    memberProfile?: {
        baptismDate?: string;
        ministries: string[];
    };
}

interface GroupItem {
    id: string;
    name: string;
}

interface CongregationItem {
    id: string;
    name: string;
    isHeadquarter: boolean;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    PASTOR: { label: 'Pastor', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    DIRECTOR: { label: 'Diretoria', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    ADMIN_WELCOME: { label: 'Acolhimento', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
    GC_SUPERVISOR: { label: 'Supervisor GC', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    GC_LEADER: { label: 'Líder GC', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    WORSHIP_LEADER: { label: 'Líder Louvor', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
    MEMBER: { label: 'Membro', color: 'bg-slate-800 text-slate-300 border-slate-700' },
};

export default function MemberList() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal de Cadastro de Novo Membro
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [connectionGroupId, setConnectionGroupId] = useState('');
    const [congregationId, setCongregationId] = useState('');
    const [availableGroups, setAvailableGroups] = useState<GroupItem[]>([]);
    const [availableCongregations, setAvailableCongregations] = useState<CongregationItem[]>([]);

    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') || currentUser?.role === 'SUPER_ADMIN';
    const isPastor = currentUser?.roles?.includes('PASTOR') || currentUser?.role === 'PASTOR';
    const isDirector = currentUser?.roles?.includes('DIRECTOR') || currentUser?.role === 'DIRECTOR';
    const cannotEditOthers = currentUser?.roles?.some(r => ['MEMBER', 'WORSHIP_LEADER', 'GC_LEADER'].includes(r));
    const canCreate = isSuperAdmin || (!cannotEditOthers);
    const canDelete = isSuperAdmin || isPastor || isDirector;

    const handleDeleteMember = async (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o membro "${name}"? Esta ação não pode ser desfeita.`)) {
            try {
                await api.delete(`/members/${id}`);
                showSuccess('Membro excluído com sucesso!');
                fetchMembers();
            } catch (error) {
                showError(getApiErrorMessage(error, 'Erro ao excluir membro.'));
            }
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchGroups();
        if (isSuperAdmin) {
            fetchCongregations();
        }
    }, [isSuperAdmin]);

    const fetchMembers = async () => {
        try {
            const response = await api.get('/members');
            setMembers(response.data);
        } catch (error) {
            showError(UI_MESSAGES.ERRORS.LOAD_MEMBERS);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await api.get('/connection-groups');
            setAvailableGroups(res.data);
        } catch (err) {
        }
    };

    const fetchCongregations = async () => {
        try {
            const res = await api.get('/congregations');
            setAvailableCongregations(res.data);
        } catch (err) {

        }
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            showError('Nome completo é obrigatório.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/members', {
                fullName,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                password: password.trim() || undefined,
                connectionGroupId: connectionGroupId || undefined,
                congregationId: isSuperAdmin ? (congregationId || undefined) : undefined
            });

            showSuccess(response.data.message || 'Membro cadastrado com sucesso!');
            setShowModal(false);
            setFullName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setConnectionGroupId('');
            setCongregationId('');
            fetchMembers();
        } catch (error) {
            showError(getApiErrorMessage(error, 'Erro ao cadastrar novo membro.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-16">
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/hub/membros')} className="text-slate-400 hover:text-white p-2 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Membros Oficiais</h1>
                        <p className="text-xs text-blue-400">{members.length} membros ativos</p>
                    </div>
                </div>

                {canCreate && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs py-2.5 px-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                    >
                        <UserPlus size={16} />
                        Novo Membro
                    </button>
                )}
            </header>

            <main className="p-4 sm:p-6 max-w-lg mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10 p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                        <p>Nenhum membro cadastrado ainda.</p>
                        {canCreate && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-2"
                            >
                                <Plus size={16} /> Cadastrar Primeiro Membro
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {members.map(member => {
                            const ministriesList = member.memberProfile?.ministries || [];
                            const gcName = member.connectionGroup?.name;

                            // Ordenar e formatar papéis para exibição limpa
                            const userRoles = member.roles || ['MEMBER'];
                            const displayRoles = userRoles.slice(0, 2);
                            const extraRolesCount = userRoles.length - displayRoles.length;

                            return (
                                <div
                                    key={member.id}
                                    className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col gap-3 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div
                                            onClick={() => navigate(`/membros/${member.id}`)}
                                            className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                                        >
                                            <div className="bg-blue-500/20 text-blue-400 p-2.5 rounded-xl shadow-inner shrink-0 mt-0.5">
                                                <UserCheck size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-base truncate">
                                                    {member.fullName}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {displayRoles.map((r) => {
                                                        const badge = ROLE_LABELS[r] || { label: r, color: 'bg-slate-800 text-slate-300 border-slate-700' };
                                                        return (
                                                            <span
                                                                key={r}
                                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        );
                                                    })}

                                                    {extraRolesCount > 0 && (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border bg-slate-800 text-slate-400 border-slate-700" title={userRoles.slice(2).join(', ')}>
                                                            +{extraRolesCount}
                                                        </span>
                                                    )}

                                                    {gcName && (
                                                        <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                                            <Users size={10} />
                                                            GC {gcName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            <Dropdown>
                                                <DropdownButton outline>
                                                    <span>Opções</span>
                                                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                                </DropdownButton>
                                                <DropdownMenu align="right">
                                                    <DropdownItem href={`/membros/${member.id}`}>
                                                        <Eye className="w-4 h-4 text-blue-400" />
                                                        <span>Visualizar</span>
                                                    </DropdownItem>
                                                    <DropdownItem href={`/membros/${member.id}/editar`}>
                                                        <Edit3 className="w-4 h-4 text-cyan-400" />
                                                        <span>Editar</span>
                                                    </DropdownItem>
                                                    {canDelete && (
                                                        <DropdownItem onClick={() => handleDeleteMember(member.id, member.fullName)} destructive>
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Excluir</span>
                                                        </DropdownItem>
                                                    )}
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    {ministriesList.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
                                            <Briefcase size={12} className="text-cyan-400 shrink-0" />
                                            {ministriesList.map((m, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-medium px-2 py-0.5 rounded-md"
                                                >
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal de Cadastro de Novo Membro */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <UserPlus size={18} className="text-blue-500" />
                                Cadastrar Novo Membro
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMember} className="space-y-4">
                            {/* Seleção de Filial / Congregação (Exclusivo SUPER_ADMIN) */}
                            {isSuperAdmin && (
                                <div className="space-y-1.5 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                                    <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                                        <Church size={14} />
                                        Filial / Congregação do Membro
                                    </label>
                                    <select
                                        value={congregationId}
                                        onChange={(e) => setCongregationId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:border-amber-500 outline-none cursor-pointer"
                                    >
                                        <option value="">Congregação Atual / Padrão (Sede)</option>
                                        {availableCongregations.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.isHeadquarter ? '(Sede Principal)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-amber-300/70">
                                        Como SUPER ADMIN, você pode vincular este membro diretamente a uma filial.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ex: João da Silva"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">E-mail (Opcional)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="deixe em branco para auto-gerar"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none"
                                />
                                <p className="text-[11px] text-slate-500">Se não preenchido, um e-mail padrão será gerado.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Telefone (Opcional)</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(maskPhoneNumber(e.target.value))}
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Senha (Opcional)</label>
                                    <input
                                        type="text"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Gera auto se vazio"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">Grupo de Conexão (GC)</label>
                                <select
                                    value={connectionGroupId}
                                    onChange={(e) => setConnectionGroupId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none cursor-pointer"
                                >
                                    <option value="">Nenhum GC vinculado</option>
                                    {availableGroups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            GC {g.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-sm transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Cadastrar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
