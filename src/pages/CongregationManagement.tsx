import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useCongregation, type Congregation } from '../context/CongregationContext';
import {
  Building2, Plus, Edit2, Trash2, MapPin, Phone,
  Users, UserCheck, ShieldCheck, CheckCircle2, X, Layers
} from 'lucide-react';

export default function CongregationManagement() {
  const { showError, showSuccess } = useToast();
  const { congregations, fetchCongregations, loading: loadingContext } = useCongregation();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCongregation, setEditingCongregation] = useState<Congregation | null>(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    foundedAt: '',
    isHeadquarter: false,
  });

  useEffect(() => {
    fetchCongregations();
  }, []);

  const handleOpenModal = (congregation?: Congregation) => {
    if (congregation) {
      setEditingCongregation(congregation);
      setForm({
        name: congregation.name,
        address: congregation.address || '',
        phone: congregation.phone || '',
        foundedAt: congregation.foundedAt ? new Date(congregation.foundedAt).toISOString().split('T')[0] : '',
        isHeadquarter: congregation.isHeadquarter,
      });
    } else {
      setEditingCongregation(null);
      setForm({
        name: '',
        address: '',
        phone: '',
        foundedAt: '',
        isHeadquarter: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError('O nome da congregação é obrigatório.');
      return;
    }

    try {
      setLoading(true);
      if (editingCongregation) {
        await api.put(`/congregations/${editingCongregation.id}`, form);
        showSuccess('Congregação atualizada com sucesso!');
      } else {
        await api.post('/congregations', form);
        showSuccess('Nova congregação cadastrada com sucesso!');
      }
      setShowModal(false);
      await fetchCongregations();
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erro ao salvar congregação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (c: Congregation) => {
    if (c.isHeadquarter) {
      showError('A congregação Sede Principal não pode ser excluída.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a filial "${c.name}"?`)) return;

    try {
      setLoading(true);
      await api.delete(`/congregations/${c.id}`);
      showSuccess('Filial excluída com sucesso.');
      await fetchCongregations();
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Erro ao excluir filial.');
    } finally {
      setLoading(false);
    }
  };

  const headquarter = congregations.find(c => c.isHeadquarter);
  const totalMembersCount = congregations.reduce((acc, c) => acc + (c._count?.users || 0), 0);
  const totalVisitorsCount = congregations.reduce((acc, c) => acc + (c._count?.visitors || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* Cabeçalho Principal */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-sm border border-slate-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-cyan-400 flex items-center gap-3">
            <Building2 className="text-cyan-400" size={32} />
            Gestão de Congregações
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Administração central da Sede Principal e controle integrado de todas as filiais.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-sm shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Cadastrar Filial</span>
        </button>
      </header>

      {/* Cards de Métricas e Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 min-w-0">
          <div className="p-2.5 sm:p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shrink-0">
            <Building2 size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium block truncate">Total de Igrejas</span>
            <span className="text-xl sm:text-2xl font-black text-white">{congregations.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3.5 min-w-0">
          <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium block truncate">Sede Principal</span>
            <span className="text-xs sm:text-sm font-bold text-amber-400 truncate block" title={headquarter?.name || 'Sede Central'}>
              {headquarter?.name || 'Sede Central'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Membros Globais</span>
            <span className="text-2xl font-black text-white">{totalMembersCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Visitantes Globais</span>
            <span className="text-2xl font-black text-white">{totalVisitorsCount}</span>
          </div>
        </div>
      </div>

      {/* Tabela de Congregações */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            Lista de Congregações Cadastradas
          </h2>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 font-medium">
            {congregations.length} {congregations.length === 1 ? 'congregação' : 'congregações'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Nome da Congregação</th>
                <th className="py-3.5 px-4">Endereço</th>
                <th className="py-3.5 px-4">Telefone</th>
                <th className="py-3.5 px-4 text-center">Membros</th>
                <th className="py-3.5 px-4 text-center">Visitantes</th>
                <th className="py-3.5 px-4 text-center">GCs</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loadingContext && congregations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-medium">
                    Carregando congregações...
                  </td>
                </tr>
              ) : congregations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-medium">
                    Nenhuma filial cadastrada até o momento.
                  </td>
                </tr>
              ) : (
                congregations.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      {c.isHeadquarter ? (
                        <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={12} /> SEDE MATRIZ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                          FILIAL
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {c.name}
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">
                      {c.address ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-500 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{c.address}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Não informado</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {c.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-slate-500 flex-shrink-0" />
                          <span>{c.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Não informado</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-200">
                      {c._count?.users || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-200">
                      {c._count?.visitors || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-200">
                      {c._count?.connectionGroups || 0}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-700"
                          title="Editar filial"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!c.isHeadquarter && (
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer border border-red-900/50"
                            title="Excluir filial"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {editingCongregation ? 'Editar Congregação' : 'Cadastrar Nova Filial'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Preencha as informações da unidade abaixo.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm font-sans">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nome da Congregação / Igreja *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Filial Jardim América"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Ex: Av. Principal, nº 100 - Bairro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Data de Fundação
                  </label>
                  <input
                    type="date"
                    value={form.foundedAt}
                    onChange={e => setForm({ ...form, foundedAt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-slate-300 font-medium bg-slate-950 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.isHeadquarter}
                    onChange={e => setForm({ ...form, isHeadquarter: e.target.checked })}
                    className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <span className="block text-sm text-white font-semibold">Sede Principal (Matriz)</span>
                    <span className="block text-xs text-slate-400 font-normal">Define esta congregação como a Matriz da igreja</span>
                  </div>
                </label>
              </div>

              <div className="pt-5 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/20 px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Dados'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
