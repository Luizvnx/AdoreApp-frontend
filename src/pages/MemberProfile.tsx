import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Save, MapPin, Phone, Briefcase, Check, Plus, Users, Shield } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';
import type { UserRole } from '../types';

interface Member {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    connectionGroupId?: string | null;
    connectionGroup?: {
        id: string;
        name: string;
    };
    memberProfile?: {
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

interface MinistryItem {
    id: string;
    name: string;
}

interface GroupItem {
    id: string;
    name: string;
}

const ALL_SYSTEM_ROLES: { role: UserRole; label: string; description: string }[] = [
    { role: 'SUPER_ADMIN', label: 'SUPER ADMIN (Pastor / Diretoria)', description: 'Acesso total a todas as telas, métricas e gestão.' },
    { role: 'ADMIN_WELCOME', label: 'ADMIN WELCOME (Acolhimento)', description: 'Gestão de visitantes e conversão para membros.' },
    { role: 'GC_SUPERVISOR', label: 'GC SUPERVISOR (Supervisor de GCs)', description: 'Gestão de múltiplos Grupos de Conexão.' },
    { role: 'GC_LEADER', label: 'GC LEADER (Líder de GC)', description: 'Gestão de membros e visitantes do seu GC.' },
    { role: 'WORSHIP_LEADER', label: 'WORSHIP LEADER (Líder de Louvor)', description: 'Gestão de cargos, equipes e ministérios.' },
    { role: 'MEMBER', label: 'MEMBER (Membro Comum)', description: 'Acesso restrito ao próprio perfil e dados do seu GC.' },
];

export default function MemberProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [member, setMember] = useState<Member | null>(null);

    // Roles de Acesso ao Sistema
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['MEMBER']);

    // Formulário
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [joinDate, setJoinDate] = useState('');
    const [baptismDate, setBaptismDate] = useState('');
    
    // Cargos / Ministérios
    const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
    const [availableMinistries, setAvailableMinistries] = useState<MinistryItem[]>([]);

    // Grupos de Conexão (GCs)
    const [connectionGroupId, setConnectionGroupId] = useState<string>('');
    const [availableGroups, setAvailableGroups] = useState<GroupItem[]>([]);

    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') || currentUser?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Buscar lista de cargos disponíveis
            try {
                const minRes = await api.get('/ministries');
                setAvailableMinistries(minRes.data);
            } catch (err) {
                // showError not needed for silent load failures
            }

            // Buscar lista de GCs disponíveis
            try {
                const groupRes = await api.get('/connection-groups');
                setAvailableGroups(groupRes.data);
            } catch (err) {
                // showError not needed for silent load failures
            }

            // Buscar dados do membro
            const response = await api.get('/members');
            const found = response.data.find((m: Member) => m.id === id);
            
            if (found) {
                setMember(found);
                setFullName(found.fullName);
                setSelectedRoles(found.roles && found.roles.length > 0 ? found.roles : ['MEMBER']);
                setConnectionGroupId(found.connectionGroupId || found.connectionGroup?.id || '');
                if (found.memberProfile) {
                    setPhone(found.memberProfile.phone || '');
                    setAddress(found.memberProfile.address || '');
                    setZipCode(found.memberProfile.zipCode || '');
                    setNeighborhood(found.memberProfile.neighborhood || '');
                    if (found.memberProfile.birthDate) setBirthDate(new Date(found.memberProfile.birthDate).toISOString().split('T')[0]);
                    if (found.memberProfile.joinDate) setJoinDate(new Date(found.memberProfile.joinDate).toISOString().split('T')[0]);
                    if (found.memberProfile.baptismDate) setBaptismDate(new Date(found.memberProfile.baptismDate).toISOString().split('T')[0]);
                    if (found.memberProfile.ministries) {
                        setSelectedMinistries(found.memberProfile.ministries);
                    }
                }
            } else {
                showError('Membro não encontrado.');
                navigate('/membros');
            }
        } catch (error) {
            showError('Erro ao carregar membro.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSystemRole = (role: string) => {
        setSelectedRoles(prev => {
            if (prev.includes(role)) {
                if (prev.length === 1) return prev; // Mantém pelo menos um papel
                return prev.filter(r => r !== role);
            }
            return [...prev, role];
        });
    };

    const toggleMinistry = (name: string) => {
        setSelectedMinistries(prev => 
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/members/${id}`, {
                fullName,
                phone,
                address,
                zipCode,
                neighborhood,
                birthDate: birthDate ? new Date(birthDate).toISOString() : null,
                joinDate: joinDate ? new Date(joinDate).toISOString() : null,
                baptismDate: baptismDate ? new Date(baptismDate).toISOString() : null,
                ministries: selectedMinistries,
                connectionGroupId: connectionGroupId || null,
                roles: selectedRoles
            });
            
            showSuccess(UI_MESSAGES.SUCCESS.PROFILE_UPDATED);
            navigate('/membros');
        } catch (error) {
            showError(getApiErrorMessage(error, UI_MESSAGES.ERRORS.UPDATE_PROFILE));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Combinar ministérios cadastrados na API com quaisquer valores personalizados legados
    const allMinistryNames = Array.from(
        new Set([
            ...availableMinistries.map(m => m.name),
            ...selectedMinistries
        ])
    ).sort((a, b) => a.localeCompare(b));

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-16">
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center gap-4 sticky top-0 z-10 pt-safe">
                <button onClick={() => navigate('/membros')} className="text-slate-400 hover:text-white p-2 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-white">Perfil do Membro</h1>
                    <p className="text-xs text-blue-400">Edição de dados completos</p>
                </div>
            </header>

            <main className="p-4 sm:p-6 max-w-lg mx-auto w-full">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Seção de Permissões / Perfis de Acesso ao Sistema (Exclusivo SUPER_ADMIN) */}
                    {isSuperAdmin && (
                        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl shadow-cyan-500/5">
                            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Shield size={16} className="text-cyan-400" />
                                Perfis de Acesso ao Sistema (Permissões RBAC)
                            </h3>

                            <p className="text-xs text-slate-400">
                                Como Administrador, selecione os papéis de acesso que este usuário possui no aplicativo:
                            </p>

                            <div className="space-y-2.5 pt-1">
                                {ALL_SYSTEM_ROLES.map(({ role, label, description }) => {
                                    const isSelected = selectedRoles.includes(role);
                                    return (
                                        <div
                                            key={role}
                                            onClick={() => toggleSystemRole(role)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                                isSelected
                                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border transition-all ${
                                                isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-700 bg-slate-900'
                                            }`}>
                                                {isSelected && <Check size={12} strokeWidth={3} />}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-200">{label}</h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Dados Pessoais */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                            <User size={16} className="text-blue-500" />
                            Dados Pessoais
                        </h3>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400">Nome Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                required
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400">E-mail (Leitura)</label>
                            <input
                                type="email"
                                value={member?.email || ''}
                                readOnly
                                className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl py-3 px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                    <Phone size={14} /> Telefone
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(99) 99999-9999"
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                    <Calendar size={14} /> Data Nasc.
                                </label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                            <MapPin size={16} className="text-blue-500" />
                            Localização
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400">CEP</label>
                                <input
                                    type="text"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="00000-000"
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400">Bairro</label>
                                <input
                                    type="text"
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400">Endereço Completo</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Rua, Número, Complemento..."
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Dados Eclesiásticos */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                            <Calendar size={16} className="text-blue-500" />
                            Dados Eclesiásticos
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400">Ingresso na Igreja</label>
                                <input
                                    type="date"
                                    value={joinDate}
                                    onChange={(e) => setJoinDate(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-400">Data de Batismo</label>
                                <input
                                    type="date"
                                    value={baptismDate}
                                    onChange={(e) => setBaptismDate(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Seleção do Grupo de Conexão (GC) */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                    <Users size={14} className="text-cyan-400" />
                                    Grupo de Conexão (GC)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => navigate('/gcs')}
                                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 hover:underline transition-all"
                                >
                                    <Plus size={12} />
                                    Gerenciar GCs
                                </button>
                            </div>

                            <select
                                value={connectionGroupId}
                                onChange={(e) => setConnectionGroupId(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all cursor-pointer"
                            >
                                <option value="">Nenhum GC vinculado</option>
                                {availableGroups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        GC {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Seleção de Cargos / Ministérios na Igreja */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                    <Briefcase size={14} className="text-blue-400" />
                                    Cargos & Ministérios na Igreja
                                </label>
                                <button
                                    type="button"
                                    onClick={() => navigate('/cargos')}
                                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 hover:underline transition-all"
                                >
                                    <Plus size={12} />
                                    Gerenciar Cargos
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-500">
                                Clique para selecionar ou desmarcar os cargos deste membro:
                            </p>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {allMinistryNames.map((name) => {
                                    const isSelected = selectedMinistries.includes(name);
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => toggleMinistry(name)}
                                            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all active:scale-95 ${
                                                isSelected
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                                                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                            }`}
                                        >
                                            <div
                                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                                                    isSelected
                                                        ? 'bg-blue-500 border-blue-400 text-white'
                                                        : 'border-slate-700 bg-slate-900'
                                                }`}
                                            >
                                                {isSelected && <Check size={10} strokeWidth={3} />}
                                            </div>
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedMinistries.length > 0 && (
                                <p className="text-[11px] text-slate-400 pt-1">
                                    <span className="font-semibold text-blue-400">{selectedMinistries.length}</span> cargo(s) selecionado(s): {selectedMinistries.join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}

