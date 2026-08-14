import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Save, MapPin, Phone, User, Heart } from 'lucide-react';

export default function VisitorRegistration() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulação do envio para o banco de dados
        setTimeout(() => {
            setLoading(false);
            alert('Visitante cadastrado com sucesso!');
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-10">
            {/* Header Fixo */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-white">Novo Visitante</h1>
                    <p className="text-xs text-cyan-400">Ficha de Acolhimento</p>
                </div>
            </header>

            <main className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Sessão: Dados Pessoais */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <User size={16} className="text-cyan-500" /> Dados Pessoais
                        </h2>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Nome Completo</label>
                            <input type="text" required placeholder="Ex: Maria Silva" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Nascimento</label>
                                <input type="date" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-wider">Estado Civil</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none appearance-none">
                                    <option value="SOLTEIRO">Solteiro(a)</option>
                                    <option value="CASADO">Casado(a)</option>
                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                    <option value="VIUVO">Viúvo(a)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">WhatsApp (Contato)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                                    <Phone size={16} />
                                </span>
                                <input type="tel" required placeholder="(00) 00000-0000" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 mt-1 text-sm text-white focus:border-cyan-500 outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Sessão: Endereço */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-cyan-500" /> Localização
                        </h2>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Bairro</label>
                            <input type="text" required placeholder="Ex: Centro" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Endereço Completo</label>
                            <input type="text" placeholder="Rua, Número, Complemento" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white focus:border-cyan-500 outline-none" />
                        </div>
                    </section>

                    {/* Sessão: Integração */}
                    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                            <Heart size={16} className="text-cyan-500" /> Integração Espiritual
                        </h2>

                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
                            <span className="text-sm text-slate-300">Já é batizado?</span>
                            <input type="checkbox" className="w-5 h-5 accent-cyan-500" />
                        </div>

                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl">
                            <span className="text-sm text-slate-300">Deseja entrar em um GC?</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500" />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase tracking-wider">Como chegou à igreja?</label>
                            <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-slate-300 focus:border-cyan-500 outline-none appearance-none">
                                <option value="CONVITE">Convite de Amigo/Parente</option>
                                <option value="REDES_SOCIAIS">Redes Sociais (Instagram/YouTube)</option>
                                <option value="PASSOU_FRENTE">Passou em frente</option>
                                <option value="OUTRO">Outro motivo</option>
                            </select>
                        </div>
                    </section>

                    {/* Botão de Envio */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={20} /> Salvar Visitante
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}