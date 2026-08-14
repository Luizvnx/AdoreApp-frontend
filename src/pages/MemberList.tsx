import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Shield, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

interface Member {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    memberProfile?: {
        baptismDate?: string;
        ministries: string[];
    };
}

export default function MemberList() {
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await api.get('/members');
            setMembers(response.data);
        } catch (error) {
            console.error('Erro ao buscar membros:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-16">
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center gap-4 sticky top-0 z-10 pt-safe">
                <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-white">Membros Oficiais</h1>
                    <p className="text-xs text-blue-400">{members.length} membros ativos</p>
                </div>
            </header>

            <main className="p-4 sm:p-6 max-w-lg mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10 p-6 bg-slate-900 rounded-2xl border border-slate-800">
                        Nenhum membro cadastrado ainda.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {members.map(member => (
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
                                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{member.fullName}</h3>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Shield size={10} className="text-blue-500" />
                                                {member.roles.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
