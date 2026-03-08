import React, { useState, useEffect } from 'react';
import { useJobsStore } from '../store';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Jobs() {
  const {
    jobs,
    loading,
    fetchJobs,
    adicionarJob,
    atualizarJob,
    deletarJob
  } = useJobsStore();

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState({
    Descricao: '',
    Status: 'Pendente',
    FK_Cliente: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const jobsFiltrados = jobs.filter((job) => {
    const matchBusca = job.Descricao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !statusFiltro || job.Status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const handleAbrir = (job = null) => {
    if (job) {
      setFormulario(job);
      setEditando(job.ID);
    } else {
      setFormulario({
        Descricao: '',
        Status: 'Pendente',
        FK_Cliente: ''
      });
      setEditando(null);
    }
    setModalOpen(true);
    setErro('');
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formulario.Descricao) {
      setErro('Descrição é obrigatória');
      return;
    }

    const resultado = editando
      ? await atualizarJob(editando, formulario)
      : await adicionarJob(formulario);

    if (resultado.sucesso) {
      setModalOpen(false);
      await fetchJobs();
    } else {
      setErro(resultado.erro);
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este job?')) {
      const resultado = await deletarJob(id);
      if (resultado.sucesso) {
        await fetchJobs();
      }
    }
  };

  const getStatusColor = (status) => {
    const cores = {
      'Pendente': 'bg-yellow-500/20 text-yellow-300',
      'Em Progresso': 'bg-blue-500/20 text-blue-300',
      'Concluído': 'bg-green-500/20 text-green-300',
      'Cancelado': 'bg-red-500/20 text-red-300'
    };
    return cores[status] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div className="space-y-6 px-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Jobs</h1>
          <p className="text-slate-400 mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} cadastrado{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => handleAbrir()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Novo Job
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar jobs..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
          <option value="">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Em Progresso">Em Progresso</option>
          <option value="Concluído">Concluído</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Descrição
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-slate-400">
                    Carregando...
                  </td>
                </tr>
              ) : jobsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-slate-400">
                    Nenhum job encontrado
                  </td>
                </tr>
              ) : (
                jobsFiltrados.map((job) => (
                  <tr
                    key={job.ID}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{job.Descricao}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.Status)}`}>
                          {job.Status}
                        </span>
                        <button
                          onClick={() => handleAbrir(job)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletar(job.ID)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editando ? 'Editar Job' : 'Novo Job'}
            </h2>

            {erro && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4">
                <p className="text-red-300 text-sm">{erro}</p>
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={formulario.Descricao}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Descricao: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Status
                </label>
                <select
                  value={formulario.Status}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Status: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option>Pendente</option>
                  <option>Em Progresso</option>
                  <option>Concluído</option>
                  <option>Cancelado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
