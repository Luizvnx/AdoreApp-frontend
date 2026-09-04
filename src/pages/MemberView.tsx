import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Phone, Briefcase, Users, Edit3, Trash2, Church, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/messageHandler';
import { maskPhoneNumber } from '../utils/phoneUtils';
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

import { Avatar } from '@/components/avatar';

interface Member {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    avatarUrl?: string | null;
    congregationId?: string | null;
    congregation?: {
        id: string;
        name: string;
    } | null;
    connectionGroupId?: string | null;
    connectionGroup?: {
        id: string;
        name: string;
    };
    memberProfile?: {
        avatarUrl?: string | null;
        phone?: string;
        address?: string;
        zipCode?: string;
        neighborhood?: string;
        birthDate?: string;
        joinDate?: string;
        baptismDate?: string;
        ministries: string[];
    };
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

export default function MemberView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState<Member | null>(null);

    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') || currentUser?.role === 'SUPER_ADMIN';
    const isPastor = currentUser?.roles?.includes('PASTOR') || currentUser?.role === 'PASTOR';
    const isDirector = currentUser?.roles?.includes('DIRECTOR') || currentUser?.role === 'DIRECTOR';
    const cannotEditOthers = currentUser?.roles?.some(r => ['MEMBER', 'WORSHIP_LEADER', 'GC_LEADER'].includes(r as any));
    const canEdit = isSuperAdmin || currentUser?.id === id || (!cannotEditOthers);
    const canDelete = isSuperAdmin || isPastor || isDirector;

    useEffect(() => {
        fetchMemberData();
    }, [id]);

    const fetchMemberData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/members');
            const found = response.data.find((m: Member) => m.id === id);

            if (found) {
                setMember(found);
            } else {
                showError('Membro não encontrado.');
                navigate('/membros');
            }
        } catch (error) {
            showError('Erro ao carregar dados do membro.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o membro "${member?.fullName}"? Esta ação não pode ser desfeita.`)) return;
        try {
            await api.delete(`/members/${id}`);
            showSuccess('Membro excluído com sucesso.');
            navigate('/membros');
        } catch (error) {
            showError(getApiErrorMessage(error, 'Erro ao excluir membro.'));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!member) return null;

    const rawPhone = member.memberProfile?.phone || '';
    const formattedPhone = maskPhoneNumber(rawPhone);
    const whatsappNum = rawPhone.replace(/\D/g, '');

    const ministriesList = member.memberProfile?.ministries || [];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString('pt-BR');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-16">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/membros')} className="text-slate-400 hover:text-white p-2 transition-colors">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Visualização do Membro</h1>
                        <p className="text-xs text-blue-400">Perfil cadastral</p>
                    </div>
                </div>

                <Dropdown>
                    <DropdownButton outline>
                        <span>Opções</span>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                    </DropdownButton>
                    <DropdownMenu align="right">
                        {canEdit && (
                            <DropdownItem href={`/membros/${id}/editar`}>
                                <Edit3 className="w-4 h-4 text-cyan-400" />
                                <span>Editar Perfil</span>
                            </DropdownItem>
                        )}
                        <DropdownItem href="/membros">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span>Ver Todos os Membros</span>
                        </DropdownItem>
                        {canDelete && (
                            <DropdownItem onClick={handleDelete} destructive>
                                <Trash2 className="w-4 h-4" />
                                <span>Excluir Membro</span>
                            </DropdownItem>
                        )}
                    </DropdownMenu>
                </Dropdown>
            </header>

            <main className="p-4 sm:p-6 max-w-lg mx-auto w-full space-y-5">
                {/* Main Hero Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-1 shadow-lg shadow-blue-500/30">
                        <Avatar
                            src={member.avatarUrl || member.memberProfile?.avatarUrl}
                            initials={member.fullName ? member.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'M'}
                            className="w-full h-full text-2xl font-extrabold rounded-full"
                        />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white">{member.fullName}</h2>
                        <p className="text-xs text-slate-400">{member.email}</p>
                    </div>

                    {/* Roles Badges */}
                    <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1">
                        {member.roles?.map(r => {
                            const info = ROLE_LABELS[r] || { label: r, color: 'bg-slate-800 text-slate-300 border-slate-700' };
                            return (
                                <span key={r} className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${info.color}`}>
                                    {info.label}
                                </span>
                            );
                        })}
                    </div>

                    {/* Badges de GC e Congregação */}
                    <div className="flex flex-wrap justify-center items-center gap-2 pt-2 border-t border-slate-800/80 w-full">
                        {member.connectionGroup?.name && (
                            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1.5">
                                <Users size={14} />
                                GC {member.connectionGroup.name}
                            </span>
                        )}

                        {member.congregation?.name && (
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1.5">
                                <Church size={14} />
                                {member.congregation.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Seção Contato */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                        <Phone size={14} className="text-blue-400" /> Contato
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                            <div>
                                <p className="text-[11px] text-slate-400">Telefone</p>
                                <p className="font-semibold text-white">{formattedPhone || 'Não informado'}</p>
                            </div>
                            {whatsappNum && (
                                <a
                                    href={`https://wa.me/55${whatsappNum}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-medium"
                                >
                                    <MessageCircle size={16} />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                            <p className="text-[11px] text-slate-400">E-mail de Acesso</p>
                            <p className="font-semibold text-white truncate">{member.email}</p>
                        </div>
                    </div>
                </div>

                {/* Seção Endereço */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                        <MapPin size={14} className="text-cyan-400" /> Localização
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                                <p className="text-[11px] text-slate-400">Bairro</p>
                                <p className="font-semibold text-white">{member.memberProfile?.neighborhood || 'Não informado'}</p>
                            </div>
                            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                                <p className="text-[11px] text-slate-400">CEP</p>
                                <p className="font-semibold text-white">{member.memberProfile?.zipCode || 'Não informado'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                            <p className="text-[11px] text-slate-400">Endereço Completo</p>
                            <p className="font-semibold text-white">{member.memberProfile?.address || 'Não informado'}</p>
                        </div>
                    </div>
                </div>

                {/* Seção Dados Eclesiásticos */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                        <Calendar size={14} className="text-purple-400" /> Datas Eclesiásticas
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                            <p className="text-[10px] text-slate-400">Nascimento</p>
                            <p className="font-semibold text-white">{formatDate(member.memberProfile?.birthDate) || '-'}</p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                            <p className="text-[10px] text-slate-400">Ingresso</p>
                            <p className="font-semibold text-white">{formatDate(member.memberProfile?.joinDate) || '-'}</p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                            <p className="text-[10px] text-slate-400">Batismo</p>
                            <p className="font-semibold text-white">{formatDate(member.memberProfile?.baptismDate) || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Seção Cargos & Ministérios */}
                {ministriesList.length > 0 && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
                            <Briefcase size={14} className="text-pink-400" /> Cargos e Ministérios
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {ministriesList.map((m, idx) => (
                                <span
                                    key={idx}
                                    className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
                                >
                                    {m}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botão Principal de Edição */}
                {canEdit && (
                    <Link
                        to={`/membros/${id}/editar`}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
                    >
                        <Edit3 size={18} />
                        Editar Dados do Membro
                    </Link>
                )}
            </main>
        </div>
    );
}
