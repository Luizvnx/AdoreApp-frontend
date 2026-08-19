import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Trash2, Phone, UserPlus, UserCheck, Edit3, Mail, X, Save } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

interface Visitor {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    neighborhood?: string;
    fullAddress?: string;
    wantsToJoinGC: boolean;
    isBaptized?: boolean;
    visitDate: string;
    status: string;
}

export default function VisitorList() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado para edição
    const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        neighborhood: '',
        fullAddress: '',
        wantsToJoinGC: false,
    });
    const [savingEdit, setSavingEdit] = useState(false);

    // Busca inicial dos dados
    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const response = await api.get('/visitors');
            setVisitors(response.data);
        } catch (error) {
            showError(UI_MESSAGES.ERRORS.LOAD_VISITORS);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este visitante?')) {
            try {
                await api.delete(`/visitors/${id}`);
                setVisitors(visitors.filter(v => v.id !== id));
                showSuccess(UI_MESSAGES.SUCCESS.VISITOR_DELETED);
            } catch (error) {
                showError(UI_MESSAGES.ERRORS.DELETE_VISITOR);
            }
        }
    };

    const handleConvert = async (id: string) => {
        if (window.confirm('Tem certeza que deseja promover este visitante a membro oficial?')) {
            try {
                const res = await api.put(`/visitors/${id}/convert`);
                const { credentials } = res.data;
                // Para exibir as credenciais de forma mais amigável usando alert ainda ou toast grande, 
                // mas a instrução é usar apenas toast. O Toast foi feito pra mensagens curtas.
                // Como as credenciais são importantes, usarei o showSuccess, e talvez um alert nativo se for muita informação, 
                // mas vou usar alert nativo para credenciais e showSuccess pra bolha? 
                // A instrução diz "Não utilize mais alert para enviar mensagens ao usuário em mensagens de sucesso".
                // Mas as credenciais precisam ser copiadas pelo usuário. O toast desaparece em 4 segundos!
                // Vou manter um window.alert ou prompt apenas para as credenciais geradas, 
                // mas substituindo o alert de sucesso principal pelo Toast.
                showSuccess(UI_MESSAGES.SUCCESS.VISITOR_CONVERTED);
                window.alert(`Credenciais de acesso geradas:\n\nE-mail: ${credentials.email}\nSenha: ${credentials.password}\n\nPor favor, copie e envie ao novo membro.`);
                fetchVisitors(); // Recarrega a lista para remover o membro convertido
            } catch (error: any) {
                showError(getApiErrorMessage(error));
            }
        }
    };

    const openEditModal = (visitor: Visitor) => {
        setEditingVisitor(visitor);
        setEditFormData({
            fullName: visitor.fullName || '',
            email: visitor.email || '',
            phone: visitor.phone || '',
            neighborhood: visitor.neighborhood || '',
            fullAddress: visitor.fullAddress || '',
            wantsToJoinGC: visitor.wantsToJoinGC || false,
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVisitor) return;

        setSavingEdit(true);
        try {
            await api.put(`/visitors/${editingVisitor.id}`, editFormData);
            showSuccess(UI_MESSAGES.SUCCESS.VISITOR_UPDATED);
            setEditingVisitor(null);
            fetchVisitors();
        } catch (error: any) {
            showError(getApiErrorMessage(error));
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-16">
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10 pt-safe">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Lista de Visitantes</h1>
                        <p className="text-xs text-cyan-400">{visitors.length} pendentes em acompanhamento</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/cadastro/visitantes')}
                    className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                >
                    <UserPlus size={16} />
                    <span>Novo</span>
                </button>
            </header>

            <main className="p-4 sm:p-6 max-w-lg mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : visitors.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                        Nenhum visitante pendente de conversão no momento.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {visitors.map(visitor => (
                            <div
                                key={visitor.id}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col gap-3 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div
                                        onClick={() => openEditModal(visitor)}
                                        className="flex items-center gap-3 cursor-pointer group flex-1"
                                    >
                                        <div className="bg-cyan-500/20 text-cyan-400 p-2.5 rounded-full group-hover:scale-105 transition-transform">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                                {visitor.fullName}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                Visita: {new Date(visitor.visitDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(visitor)}
                                            className="text-slate-400 hover:text-cyan-400 p-2 transition-colors"
                                            title="Editar Visitante"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(visitor.id)}
                                            className="text-red-500/70 hover:text-red-500 p-2 transition-colors"
                                            title="Excluir Visitante"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-slate-800/80">
                                    <div className="flex items-center gap-2 text-xs text-slate-300">
                                        <Phone size={14} className="text-cyan-500" />
                                        {visitor.phone || 'Sem telefone'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
                                        <Mail size={14} className="text-cyan-500 shrink-0" />
                                        <span className="truncate">{visitor.email || 'Sem e-mail'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                                    {visitor.wantsToJoinGC ? (
                                        <div className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-lg">
                                            Deseja entrar em GC
                                        </div>
                                    ) : <div></div>}

                                    <button
                                        onClick={() => handleConvert(visitor.id)}
                                        className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-green-500/20 transition-all active:scale-95 ml-auto"
                                    >
                                        <UserCheck size={14} />
                                        Tornar Membro
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Edição de Visitante */}
            {editingVisitor && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Edit3 size={18} className="text-cyan-400" />
                                Editar Visitante
                            </h2>
                            <button
                                onClick={() => setEditingVisitor(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editFormData.fullName}
                                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase">E-mail</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    placeholder="exemplo@email.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase">Telefone / Whats</label>
                                    <input
                                        type="text"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase">Bairro</label>
                                    <input
                                        type="text"
                                        value={editFormData.neighborhood}
                                        onChange={(e) => setEditFormData({ ...editFormData, neighborhood: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase">Endereço Completo</label>
                                <input
                                    type="text"
                                    value={editFormData.fullAddress}
                                    onChange={(e) => setEditFormData({ ...editFormData, fullAddress: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 mt-1 text-sm text-white outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                                <span className="text-xs text-slate-300">Deseja entrar em um GC?</span>
                                <input
                                    type="checkbox"
                                    checked={editFormData.wantsToJoinGC}
                                    onChange={(e) => setEditFormData({ ...editFormData, wantsToJoinGC: e.target.checked })}
                                    className="w-4 h-4 accent-cyan-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingVisitor(null)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                                >
                                    {savingEdit ? (
                                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Salvar Alterações
                                        </>
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