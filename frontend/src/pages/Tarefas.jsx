import React, { useState, useEffect } from 'react';
import { useTarefasStore } from '../store';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Tarefas() {
  const {
    tarefas,
    loading,
    fetchTarefas,
    adicionarTarefa,
    atualizarTarefa,
    deletarTarefa
  } = useTarefasStore();

  const [busca, setBusca] = useState('');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState({
    Tarefa: '',
    Prioridade: 'Média',
    Prazo: '',
    Status: 'Pendente'
  });

  useEffect(() => {
    fetchTarefas();
  }, []);

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const matchBusca = tarefa.Tarefa.toLowerCase().includes(busca.toLowerCase());
    const matchPrioridade = !prioridadeFiltro || tarefa.Prioridade === prioridadeFiltro;
    return matchBusca && matchPrioridade;
  });

  const handleAbrir = (tarefa = null) => {
    if (tarefa) {
      setFormulario(tarefa);
      setEditando(tarefa.ID);
    } else {
      setFormulario({
        Tarefa: '',
        Prioridade: 'Média',
        Prazo: '',
        Status: 'Pendente'
      });
      setEditando(null);
    }
    setModalOpen(true);
    setErro('');
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formulario.Tarefa) {
      setErro('Tarefa é obrigatória');
      return;
    }

    const resultado = editando
      ? await atualizarTarefa(editando, formulario)
      : await adicionarTarefa(formulario);

    if (resultado.sucesso) {
      setModalOpen(false);
      await fetchTarefas();
    } else {
      setErro(resultado.erro);
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      const resultado = await deletarTarefa(id);
      if (resultado.sucesso) {
        await fetchTarefas();
      }
    }
  };

  const getPrioridadeColor = (prioridade) => {
    const cores = {
      'Alta': 'bg-red-500/20 text-red-300',
      'Média': 'bg-yellow-500/20 text-yellow-300',
      'Baixa': 'bg-green-500/20 text-green-300'
    };
    return cores[prioridade] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tarefas</h1>
          <p className="text-slate-400 mt-1">
            {tarefas.filter(t => t.Status === 'Pendente').length} pendente{tarefas.filter(t => t.Status === 'Pendente').length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => handleAbrir()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nova Tarefa
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <select
          value={prioridadeFiltro}
          onChange={(e) => setPrioridadeFiltro(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
          <option value="">Todas as Prioridades</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
      </div>

      {/* Tarefas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Carregando...</div>
        ) : tarefasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhuma tarefa encontrada</div>
        ) : (
          tarefasFiltradas.map((tarefa) => (
            <div
              key={tarefa.ID}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {tarefa.Tarefa}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${getPrioridadeColor(tarefa.Prioridade)}`}>
                      {tarefa.Prioridade}
                    </span>
                    {tarefa.Prazo && (
                      <span className="text-slate-400">
                        Prazo: {new Date(tarefa.Prazo).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span className="text-slate-400">Status: {tarefa.Status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAbrir(tarefa)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeletar(tarefa.ID)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editando ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>

            {erro && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4">
                <p className="text-red-300 text-sm">{erro}</p>
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Tarefa *
                </label>
                <textarea
                  value={formulario.Tarefa}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Tarefa: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Prioridade
                </label>
                <select
                  value={formulario.Prioridade}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Prioridade: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Prazo
                </label>
                <input
                  type="date"
                  value={formulario.Prazo || ''}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Prazo: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
