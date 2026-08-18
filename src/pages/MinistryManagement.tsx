import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Plus, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export interface Ministry {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export default function MinistryManagement() {
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMinistryName, setNewMinistryName] = useState('');
  const [newMinistryDesc, setNewMinistryDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ministries');
      setMinistries(response.data);
    } catch (error) {
      console.error('Erro ao buscar cargos/ministérios:', error);
      setErrorMsg('Erro ao carregar lista de cargos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinistryName.trim()) return;

    try {
      setAdding(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.post('/ministries', {
        name: newMinistryName.trim(),
        description: newMinistryDesc.trim() || undefined,
      });

      setMinistries((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewMinistryName('');
      setNewMinistryDesc('');
      setSuccessMsg(`Cargo "${res.data.name}" cadastrado com sucesso!`);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Erro ao cadastrar novo cargo.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cargo "${name}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/ministries/${id}`);
      setMinistries((prev) => prev.filter((m) => m.id !== id));
      setSuccessMsg(`Cargo "${name}" excluído.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Erro ao excluir cargo.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-white font-sans pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center gap-4 sticky top-0 z-10 pt-safe">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white p-2 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-cyan-400" />
            Cargos & Ministérios
          </h1>
          <p className="text-xs text-cyan-400">Gestão dos cargos da igreja</p>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-lg mx-auto w-full space-y-6">
        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
          <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Os cargos e ministérios cadastrados nesta lista ficarão disponíveis como seletores nos perfis dos membros da igreja.
          </p>
        </div>

        {/* Form para adicionar novo cargo */}
        <form
          onSubmit={handleCreate}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-md"
        >
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plus size={16} className="text-cyan-400" />
            Cadastrar Novo Cargo na Igreja
          </h2>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldCheck size={16} />
              {successMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Nome do Cargo / Ministério *</label>
            <input
              type="text"
              value={newMinistryName}
              onChange={(e) => setNewMinistryName(e.target.value)}
              placeholder="Ex: Louvor, Tesouraria, Diácono, Líder de GC..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Descrição (Opcional)</label>
            <input
              type="text"
              value={newMinistryDesc}
              onChange={(e) => setNewMinistryDesc(e.target.value)}
              placeholder="Descrição breve ou atribuições..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-3 px-4 text-sm text-white outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={adding || !newMinistryName.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {adding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus size={18} />
                Adicionar Cargo
              </>
            )}
          </button>
        </form>

        {/* Lista de Cargos */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cargos Cadastrados ({ministries.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : ministries.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6">
              Nenhum cargo cadastrado.
            </div>
          ) : (
            <div className="space-y-2.5">
              {ministries.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-slate-400">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deletingId === item.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir cargo"
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
