import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Music, Save, MapPin, Phone } from 'lucide-react';
import { api } from '../services/api';

interface Member {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
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

export default function MemberProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [member, setMember] = useState<Member | null>(null);

    // Formulário
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [joinDate, setJoinDate] = useState('');
    const [baptismDate, setBaptismDate] = useState('');
    const [ministries, setMinistries] = useState('');

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            const response = await api.get('/members');
            const found = response.data.find((m: Member) => m.id === id);
            
            if (found) {
                setMember(found);
                setFullName(found.fullName);
                if (found.memberProfile) {
                    setPhone(found.memberProfile.phone || '');
                    setAddress(found.memberProfile.address || '');
                    setZipCode(found.memberProfile.zipCode || '');
                    setNeighborhood(found.memberProfile.neighborhood || '');
                    if (found.memberProfile.birthDate) setBirthDate(new Date(found.memberProfile.birthDate).toISOString().split('T')[0]);
                    if (found.memberProfile.joinDate) setJoinDate(new Date(found.memberProfile.joinDate).toISOString().split('T')[0]);
                    if (found.memberProfile.baptismDate) setBaptismDate(new Date(found.memberProfile.baptismDate).toISOString().split('T')[0]);
                    if (found.memberProfile.ministries) setMinistries(found.memberProfile.ministries.join(', '));
                }
            } else {
                alert('Membro não encontrado.');
                navigate('/membros');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar membro.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const minArray = ministries.split(',').map(m => m.trim()).filter(m => m.length > 0);
            
            await api.put(`/members/${id}`, {
                fullName,
                phone,
                address,
                zipCode,
                neighborhood,
                birthDate: birthDate ? new Date(birthDate).toISOString() : null,
                joinDate: joinDate ? new Date(joinDate).toISOString() : null,
                baptismDate: baptismDate ? new Date(baptismDate).toISOString() : null,
                ministries: minArray
            });
            
            alert('Perfil atualizado com sucesso!');
            navigate('/membros');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar membro.');
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

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                <Music size={14} className="text-slate-400" />
                                Ministérios (separados por vírgula)
                            </label>
                            <input
                                type="text"
                                value={ministries}
                                onChange={(e) => setMinistries(e.target.value)}
                                placeholder="Louvor, Diaconia, Jovens..."
                                className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
                            />
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
