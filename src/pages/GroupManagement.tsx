import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Trash2, Sparkles, MapPin, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { UI_MESSAGES } from '../constants/messages';
import { getApiErrorMessage } from '../utils/messageHandler';

export interface ConnectionGroupItem {
  id: string;
  name: string;
  neighborhood?: string | null;
  meetingDay?: string | null;
  meetingTime?: string | null;
  _count?: {
    members: number;
    visitors: number;
  };
}

export default function GroupManagement() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [groups, setGroups] = useState<ConnectionGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connection-groups');
      setGroups(response.data);
    } catch (error) {
      showError(UI_MESSAGES.ERRORS.LOAD_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setAdding(true);

      const res = await api.post('/connection-groups', {
        name: name.trim(),
        neighborhood: neighborhood.trim() || undefined,
        meetingDay: meetingDay.trim() || undefined,
        meetingTime: meetingTime.trim() || undefined,
      });

      setGroups((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setNeighborhood('');
      setMeetingDay('');
      setMeetingTime('');
      showSuccess(UI_MESSAGES.SUCCESS.GROUP_CREATED);
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Erro ao cadastrar novo GC.'));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, groupName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o GC "${groupName}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/connection-groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      showSuccess(UI_MESSAGES.SUCCESS.GROUP_DELETED);
    } catch (err: any) {
      showError(UI_MESSAGES.ERRORS.DELETE_GROUP);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white p-2 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            Grupos de Conexão (GCs)
          </h1>
          <p className="text-xs text-cyan-400">Gestão de GCs da igreja (IDE, Reobote, Chosen, Rebecas...)</p>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-lg mx-auto w-full space-y-6">
        {/* Banner Informativo */}
        <div className="bg-slate-900 border border-slate-700 rounded-sm p-4 flex items-start gap-3">
          <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Os Grupos de Conexão (GCs) cadastrados aqui estarão disponíveis para vinculação exclusiva nos perfis dos membros oficiais da igreja.
          </p>
        </div>

        {/* Form de Cadastro de novo GC */}
        <form
          onSubmit={handleCreate}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md"
        >
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus size={16} className="text-cyan-400" />
            Criar Novo Grupo de Conexão (GC)
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Nome do GC *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: IDE, Reobote, Chosen, Rebecas..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Bairro / Localização (Opcional)</label>
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Centro, Jardins..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Dia de Encontro</label>
              <input
                type="text"
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
                placeholder="Ex: Terça-feira"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Horário</label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="Ex: 19:30"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {adding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={18} />
                Cadastrar Grupo de Conexão
              </>
            )}
          </button>
        </form>

        {/* Lista de GCs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Grupos Cadastrados ({groups.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6">
              Nenhum Grupo de Conexão cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Users size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                        GC {item.name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {item.neighborhood && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-500" />
                            {item.neighborhood}
                          </span>
                        )}
                        {(item.meetingDay || item.meetingTime) && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-500" />
                            {item.meetingDay || ''} {item.meetingTime ? `às ${item.meetingTime}` : ''}
                          </span>
                        )}
                      </div>

                      {item._count && (
                        <p className="text-[11px] text-cyan-400/80 font-medium">
                          {item._count.members} membro(s) vinculado(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deletingId === item.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                    title="Excluir GC"
                  >
                    {deletingId === item.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
