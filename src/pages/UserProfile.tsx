import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, Lock, Camera, Mail, Phone, Calendar, LogOut, Users, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

export default function UserProfile() {
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        birthDate: '',
        maritalStatus: '',
        zipCode: '',
        address: '',
        neighborhood: '',
    });

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                setFetching(true);
                const response = await api.get('/auth/me');
                const userData = response.data?.user;
                if (userData) {
                    const prof = userData.memberProfile || {};
                    setFormData({
                        fullName: userData.name || '',
                        email: userData.email || '',
                        phone: prof.phone || '',
                        password: '',
                        birthDate: prof.birthDate ? new Date(prof.birthDate).toISOString().split('T')[0] : '',
                        maritalStatus: prof.maritalStatus || '',
                        zipCode: prof.zipCode || '',
                        address: prof.address || '',
                        neighborhood: prof.neighborhood || '',
                    });
                }
            } catch (error) {
                showError(UI_MESSAGES.ERRORS.LOAD_PROFILE);
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [currentUser, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/members/${currentUser?.id}`, {
                fullName: formData.fullName,
                phone: formData.phone,
                address: formData.address,
                zipCode: formData.zipCode,
                neighborhood: formData.neighborhood,
                maritalStatus: formData.maritalStatus,
                birthDate: formData.birthDate,
                ...(formData.password ? { password: formData.password } : {})
            });

            showSuccess(UI_MESSAGES.SUCCESS.PROFILE_UPDATED);
        } catch (error) {
            showError(getApiErrorMessage(error, UI_MESSAGES.ERRORS.UPDATE_PROFILE));
        } finally {
            setLoading(false);
        }
    };

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Função para confirmar o Logout
    const confirmLogout = async () => {
        setShowLogoutModal(false);
        await logout();
        navigate('/');
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-10">
            {/* Header Fixo */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white p-2 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Meu Perfil</h1>
                        <p className="text-xs text-cyan-400">Gerencie sua conta</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Seção do Avatar */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 p-1 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                                    <User size={40} className="text-slate-400" />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 bg-slate-800 border border-slate-700 p-2 rounded-full text-cyan-400 hover:bg-slate-700 transition-colors"
                                title="Alterar foto"
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="mt-4 font-semibold text-lg">{formData.fullName || 'Usuário'}</h2>
                        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full mt-1 border border-slate-800">
                            {currentUser?.role?.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Dados Pessoais */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <User size={16} className="text-cyan-500" /> Dados Pessoais
                        </h2>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Nome Completo</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Nascimento</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                        <Calendar size={16} />
                                    </span>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Estado Civil</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none appearance-none transition-colors">
                                    <option value="">Selecione</option>
                                    <option value="SOLTEIRO">Solteiro(a)</option>
                                    <option value="CASADO">Casado(a)</option>
                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                    <option value="VIUVO">Viúvo(a)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Contato e Endereço */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-cyan-500" /> Contato e Localização
                        </h2>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Telefone / WhatsApp</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <Phone size={16} />
                                </span>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">CEP</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Bairro</label>
                                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Endereço Completo</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Rua, Número, Complemento" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
                        </div>
                    </section>

                    {/* Grupo de Conexão e Cargos */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <Users size={16} className="text-cyan-500" /> Seu Grupo de Conexão & Cargos
                        </h2>

                        {currentUser?.connectionGroup ? (
                            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-cyan-400">GC {currentUser.connectionGroup.name}</span>
                                    <span className="bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-cyan-500/20">Vinculado</span>
                                </div>
                                {currentUser.connectionGroup.neighborhood && (
                                    <p className="text-slate-300 flex items-center gap-1.5">
                                        <MapPin size={12} className="text-slate-500" />
                                        Localização: <strong>{currentUser.connectionGroup.neighborhood}</strong>
                                    </p>
                                )}
                                {(currentUser.connectionGroup.meetingDay || currentUser.connectionGroup.meetingTime) && (
                                    <p className="text-slate-300 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-slate-500" />
                                        Encontro: <strong>{currentUser.connectionGroup.meetingDay || ''} {currentUser.connectionGroup.meetingTime ? `às ${currentUser.connectionGroup.meetingTime}` : ''}</strong>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                                Você ainda não possui um Grupo de Conexão (GC) vinculado. Fale com a liderança para se conectar!
                            </p>
                        )}

                        {currentUser?.memberProfile?.ministries && currentUser.memberProfile.ministries.length > 0 && (
                            <div className="pt-2">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Cargos em que Atua</label>
                                <div className="flex flex-wrap gap-2">
                                    {currentUser.memberProfile.ministries.map((m, idx) => (
                                        <span key={idx} className="bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                                            <Briefcase size={12} className="text-blue-400" />
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Credenciais de Acesso */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <Lock size={16} className="text-cyan-500" /> Segurança e Acesso
                        </h2>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">E-mail de Acesso</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <Mail size={16} />
                                </span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-slate-400 outline-none cursor-not-allowed" disabled />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Nova Senha</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                    <Lock size={16} />
                                </span>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Deixe em branco para manter a atual" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
                            </div>
                        </div>
                    </section>

                    {/* Botão Salvar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={20} /> Salvar Alterações
                            </>
                        )}
                    </button>
                </form>

                {/* Botão de Logout (Sair da Conta) */}
                <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full bg-slate-900 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                    <LogOut size={20} /> Sair da Conta
                </button>

            </main>

            {/* Modal de Confirmação de Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                <LogOut size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Sair da Conta</h3>
                            <p className="text-sm text-slate-400">
                                Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o aplicativo.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Sim, Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}