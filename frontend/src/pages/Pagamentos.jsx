import React, { useState, useEffect } from 'react';
import { usePagamentosStore } from '../store';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Pagamentos() {
  const {
    pagamentos,
    stats,
    loading,
    fetchPagamentos,
    fetchStats,
    adicionarPagamento,
    atualizarPagamento,
    deletarPagamento
  } = usePagamentosStore();

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState({
    Descricao: '',
    Valor: '',
    Data: new Date().toISOString().split('T')[0],
    Status: 'Pendente',
    FK_Cliente: ''
  });

  useEffect(() => {
    fetchPagamentos();
    fetchStats();
  }, []);

  const pagamentosFiltrados = pagamentos.filter((pag) => {
    const matchBusca = pag.Descricao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !statusFiltro || pag.Status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const handleAbrir = (pagamento = null) => {
    if (pagamento) {
      setFormulario(pagamento);
      setEditando(pagamento.ID);
    } else {
      setFormulario({
        Descricao: '',
        Valor: '',
        Data: new Date().toISOString().split('T')[0],
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
    if (!formulario.Descricao || !formulario.Valor) {
      setErro('Descrição e Valor são obrigatórios');
      return;
    }

    const resultado = editando
      ? await atualizarPagamento(editando, formulario)
      : await adicionarPagamento(formulario);

    if (resultado.sucesso) {
      setModalOpen(false);
      await fetchPagamentos();
      await fetchStats();
    } else {
      setErro(resultado.erro);
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este pagamento?')) {
      const resultado = await deletarPagamento(id);
      if (resultado.sucesso) {
        await fetchPagamentos();
        await fetchStats();
      }
    }
  };

  const getStatusColor = (status) => {
    const cores = {
      'Pago': 'bg-green-500/20 text-green-300',
      'Pendente': 'bg-yellow-500/20 text-yellow-300',
      'Cancelado': 'bg-red-500/20 text-red-300'
    };
    return cores[status] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
          <p className="text-slate-400 mt-1">
            {pagamentos.length} pagamento{pagamentos.length !== 1 ? 's' : ''} registrado{pagamentos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => handleAbrir()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Novo Pagamento
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">
              R$ {parseFloat(stats.total_valor || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Pago</p>
            <p className="text-2xl font-bold text-green-400">
              R$ {parseFloat(stats.total_pago || stats.pago || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Pendente</p>
            <p className="text-2xl font-bold text-yellow-400">
              R$ {parseFloat(stats.total_pendente || stats.pendente || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar pagamentos..."
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
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Carregando...
                  </td>
                </tr>
              ) : pagamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : (
                pagamentosFiltrados.map((pag) => (
                  <tr
                    key={pag.ID}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{pag.Descricao}</p>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      R$ {parseFloat(pag.Valor).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(pag.Data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pag.Status)}`}>
                        {pag.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAbrir(pag)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletar(pag.ID)}
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
              {editando ? 'Editar Pagamento' : 'Novo Pagamento'}
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
                <input
                  type="text"
                  value={formulario.Descricao}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Descricao: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.Valor}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Valor: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formulario.Data}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Data: e.target.value })
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
                  <option>Pago</option>
                  <option>Pendente</option>
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
