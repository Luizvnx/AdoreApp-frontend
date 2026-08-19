import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Shield, ChevronRight, Briefcase, Users } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';

interface Member {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    connectionGroup?: {
        id: string;
        name: string;
    } | null;
    memberProfile?: {
        baptismDate?: string;
        ministries: string[];
    };
}

export default function MemberList() {
    const navigate = useNavigate();
    const { showError } = useToast();
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
            showError(UI_MESSAGES.ERRORS.LOAD_MEMBERS);
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
                        {members.map(member => {
                            const ministriesList = member.memberProfile?.ministries || [];
                            const gcName = member.connectionGroup?.name;

                            return (
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
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                    {member.fullName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Shield size={10} className="text-blue-500" />
                                                        {member.roles.join(', ')}
                                                    </span>
                                                    {gcName && (
                                                        <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                                            <Users size={10} />
                                                            GC {gcName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                    </div>

                                    {ministriesList.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
                                            <Briefcase size={12} className="text-cyan-400 shrink-0" />
                                            {ministriesList.map((m, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-medium px-2 py-0.5 rounded-md"
                                                >
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
