import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Phone, User, Heart, Mail } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

export default function VisitorRegistration() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);

    // Estado para armazenar os dados do formulário
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        birthDate: '',
        maritalStatus: 'SOLTEIRO',
        phone: '',
        neighborhood: '',
        fullAddress: '',
        isBaptized: false,
        wantsToJoinGC: true,
        howDidYouArrive: 'CONVITE',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Lida com checkboxes separadamente
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/visitors', formData);
            showSuccess(UI_MESSAGES.SUCCESS.VISITOR_REGISTERED);
            navigate('/visitantes');
        } catch (error: any) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-16">
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-white">Novo Visitante</h1>
                    <p className="text-xs text-cyan-400">Ficha de Acolhimento</p>
                </div>
            </header>

            <main className="p-4 sm:p-6 max-w-lg mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados Pessoais */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <User size={16} className="text-cyan-500" /> Dados Pessoais
                        </h2>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Nome Completo</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none" />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">E-mail (Opcional)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                                    <Mail size={16} />
                                </span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="exemplo@email.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-white outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block">Nascimento</label>
                                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full max-w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 outline-none" />
                            </div>
                            <div className="min-w-0">
                                <label className="text-xs text-slate-400 uppercase tracking-wider block">Estado Civil</label>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full max-w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 outline-none cursor-pointer">
                                    <option value="SOLTEIRO">Solteiro(a)</option>
                                    <option value="CASADO">Casado(a)</option>
                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                    <option value="VIUVO">Viúvo(a)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">WhatsApp</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                                    <Phone size={16} />
                                </span>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-white outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Localização e Integração */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-cyan-500" /> Detalhes
                        </h2>
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Bairro</label>
                            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none" />
                        </div>
                    </section>

                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <Heart size={16} className="text-cyan-500" /> Integração
                        </h2>
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
                            <span className="text-sm text-slate-300">Já é batizado?</span>
                            <input type="checkbox" name="isBaptized" checked={formData.isBaptized} onChange={handleChange} className="w-5 h-5 accent-cyan-500" />
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
                            <span className="text-sm text-slate-300">Deseja entrar em um GC?</span>
                            <input type="checkbox" name="wantsToJoinGC" checked={formData.wantsToJoinGC} onChange={handleChange} className="w-5 h-5 accent-cyan-500" />
                        </div>
                    </section>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={20} /> Salvar Visitante</>}
                    </button>
                </form>
            </main>
        </div>
    );
}