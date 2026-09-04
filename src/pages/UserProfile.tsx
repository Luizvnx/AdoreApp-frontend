import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, Lock, Camera, Mail, Phone, Calendar, LogOut, Users, Briefcase, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';
import { maskPhoneNumber } from '../utils/phoneUtils';
import { Avatar } from '../components/avatar';

export default function UserProfile() {
    const navigate = useNavigate();
    const { user: currentUser, logout, updateUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    setAvatarUrl(userData.avatarUrl || prof.avatarUrl || null);
                    setFormData({
                        fullName: userData.name || '',
                        email: userData.email || '',
                        phone: maskPhoneNumber(prof.phone) || '',
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

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        resolve(dataUrl);
                    } else {
                        reject(new Error('Falha ao processar imagem'));
                    }
                };
                img.onerror = () => reject(new Error('Falha ao carregar arquivo de imagem'));
                img.src = event.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
            return;
        }

        try {
            setUploadingPhoto(true);
            const compressedBase64 = await compressImage(file);

            setAvatarUrl(compressedBase64);
            updateUser({ avatarUrl: compressedBase64 });

            if (currentUser?.id) {
                await api.put(`/members/${currentUser.id}`, {
                    fullName: formData.fullName || currentUser.name,
                    avatarUrl: compressedBase64
                });
            }

            showSuccess('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            showError(getApiErrorMessage(error, 'Erro ao enviar foto de perfil.'));
        } finally {
            setUploadingPhoto(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemovePhoto = async () => {
        try {
            setUploadingPhoto(true);
            setAvatarUrl(null);
            updateUser({ avatarUrl: null });

            if (currentUser?.id) {
                await api.put(`/members/${currentUser.id}`, {
                    fullName: formData.fullName || currentUser.name,
                    avatarUrl: null
                });
            }

            showSuccess('Foto de perfil removida.');
        } catch (error) {
            showError('Erro ao remover foto de perfil.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setFormData(prev => ({ ...prev, phone: maskPhoneNumber(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/members/${currentUser?.id}`, {
                fullName: formData.fullName,
                avatarUrl: avatarUrl,
                phone: formData.phone,
                address: formData.address,
                zipCode: formData.zipCode,
                neighborhood: formData.neighborhood,
                maritalStatus: formData.maritalStatus,
                birthDate: formData.birthDate,
                ...(formData.password ? { password: formData.password } : {})
            });

            updateUser({
                name: formData.fullName,
                avatarUrl: avatarUrl
            });

            showSuccess(UI_MESSAGES.SUCCESS.PROFILE_UPDATED);
        } catch (error) {
            showError(getApiErrorMessage(error, UI_MESSAGES.ERRORS.UPDATE_PROFILE));
        } finally {
            setLoading(false);
        }
    };

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        await logout();
        navigate('/');
    };

    const userInitials = formData.fullName
        ? formData.fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

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
                    <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white p-2 transition-colors cursor-pointer">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Meu Perfil</h1>
                        <p className="text-xs text-cyan-400">Gerencie sua conta e foto de perfil</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Input Oculto para Seleção da Foto */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                    />

                    {/* Seção do Avatar com Upload */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 p-1 shadow-[0_0_25px_rgba(6,182,212,0.35)] relative">
                                <Avatar
                                    src={avatarUrl}
                                    initials={userInitials}
                                    className="w-full h-full text-2xl font-extrabold rounded-full"
                                />
                                {uploadingPhoto && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Botão Câmera / Upload */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="absolute bottom-0 right-0 bg-cyan-600 border border-slate-700 p-2.5 rounded-full text-white hover:bg-cyan-500 transition-all shadow-lg cursor-pointer active:scale-95"
                                title="Alterar foto de perfil"
                            >
                                <Camera size={18} />
                            </button>
                        </div>

                        {avatarUrl && (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                <Trash2 size={12} /> Remover foto
                            </button>
                        )}

                        <h2 className="mt-3 font-semibold text-lg">{formData.fullName || 'Usuário'}</h2>
                        <span className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full mt-1 border border-cyan-500/20 font-medium">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block">Nascimento</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                                        <Calendar size={16} />
                                    </span>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full max-w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none transition-colors" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block">Estado Civil</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full max-w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none appearance-none transition-colors cursor-pointer">
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
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-white focus:border-cyan-500 outline-none transition-colors" />
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
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
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
                    className="w-full bg-slate-900 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
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
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
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