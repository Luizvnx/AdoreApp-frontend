import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Shield, ChevronRight, Briefcase, Users, Plus, X, UserPlus, Church } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

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
    const cannotEditOthers = currentUser?.roles?.some(r => ['MEMBER', 'WORSHIP_LEADER', 'GC_LEADER'].includes(r));
    const canCreate = isSuperAdmin || (!cannotEditOthers);

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
                    <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2 transition-colors">
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

                            return (
                                <div
                                    key={member.id}
                                    onClick={() => navigate(`/membros/${member.id}`)}
                                    className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 text-blue-400 p-2.5 rounded-xl shadow-inner">
                                                <UserCheck size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                    {member.fullName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Shield size={10} className="text-blue-500" />
                                                        {member.roles.join(', ')}
                                                    </span>
                                                    {gcName && (
                                                        <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                                            <Users size={10} />
                                                            GC {gcName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
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
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(99) 99999-9999"
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
