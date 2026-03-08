import React, { useState, useEffect } from 'react';
import { useClientesStore } from '../store';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Clientes() {
  const {
    clientes,
    loading,
    fetchClientes,
    adicionarCliente,
    atualizarCliente,
    deletarCliente
  } = useClientesStore();

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState({
    Empresa: '',
    Email: '',
    Telefone: '',
    Status: 'Ativo',
    Endereco: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const matchBusca =
      cliente.Empresa.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.Email?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !statusFiltro || cliente.Status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const handleAbrir = (cliente = null) => {
    if (cliente) {
      setFormulario(cliente);
      setEditando(cliente.ID);
    } else {
      setFormulario({
        Empresa: '',
        Email: '',
        Telefone: '',
        Status: 'Ativo',
        Endereco: ''
      });
      setEditando(null);
    }
    setModalOpen(true);
    setErro('');
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formulario.Empresa) {
      setErro('Empresa é obrigatória');
      return;
    }

    const resultado = editando
      ? await atualizarCliente(editando, formulario)
      : await adicionarCliente(formulario);

    if (resultado.sucesso) {
      setModalOpen(false);
      await fetchClientes();
    } else {
      setErro(resultado.erro);
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      const resultado = await deletarCliente(id);
      if (resultado.sucesso) {
        await fetchClientes();
      }
    }
  };

  const getStatusColor = (status) => {
    const cores = {
      'Ativo': 'bg-green-500/20 text-green-300',
      'Inativo': 'bg-red-500/20 text-red-300',
      'Pendente': 'bg-yellow-500/20 text-yellow-300'
    };
    return cores[status] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => handleAbrir()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por empresa ou email..."
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
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Pendente">Pendente</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Telefone
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
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.ID}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{cliente.Empresa}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {cliente.Email || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {cliente.Telefone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          cliente.Status
                        )}`}
                      >
                        {cliente.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAbrir(cliente)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletar(cliente.ID)}
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
              {editando ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            {erro && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4">
                <p className="text-red-300 text-sm">{erro}</p>
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  value={formulario.Empresa}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Empresa: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formulario.Email || ''}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formulario.Telefone || ''}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Telefone: e.target.value })
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
                  <option>Ativo</option>
                  <option>Inativo</option>
                  <option>Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formulario.Endereco || ''}
                  onChange={(e) =>
                    setFormulario({ ...formulario, Endereco: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
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
