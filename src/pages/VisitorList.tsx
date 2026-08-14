import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Trash2, Phone, UserPlus } from 'lucide-react';
import { api } from '../services/api';

// Interface baseada no Prisma
interface Visitor {
    id: string;
    fullName: string;
    phone?: string;
    neighborhood?: string;
    wantsToJoinGC: boolean;
    visitDate: string;
}

export default function VisitorList() {
    const navigate = useNavigate();
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(true);

    // Busca inicial dos dados
    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const response = await api.get('/visitors');
            setVisitors(response.data);
        } catch (error) {
            console.error('Erro ao buscar visitantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este visitante?')) {
            try {
                await api.delete(`/visitors/${id}`);
                // Remove da lista localmente para não precisar fazer um novo fetch
                setVisitors(visitors.filter(v => v.id !== id));
            } catch (error) {
                alert('Erro ao excluir visitante.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-10">
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Lista de Visitantes</h1>
                        <p className="text-xs text-cyan-400">{visitors.length} cadastrados</p>
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

            <main className="p-6">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : visitors.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">Nenhum visitante cadastrado.</div>
                ) : (
                    <div className="space-y-4">
                        {visitors.map(visitor => (
                            <div key={visitor.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-full">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{visitor.fullName}</h3>
                                            <p className="text-xs text-slate-400">
                                                Visita: {new Date(visitor.visitDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(visitor.id)} className="text-red-500/70 hover:text-red-500 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800">
                                    <div className="flex items-center gap-2 text-xs text-slate-300">
                                        <Phone size={14} className="text-cyan-500" />
                                        {visitor.phone || 'Sem telefone'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-300">
                                        <MapPin size={14} className="text-cyan-500" />
                                        {visitor.neighborhood || 'Bairro ñ info.'}
                                    </div>
                                </div>

                                {visitor.wantsToJoinGC && (
                                    <div className="mt-2 text-xs font-semibold text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-lg inline-block w-fit">
                                        Deseja entrar em GC
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}