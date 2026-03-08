import React, { useState, useEffect } from 'react';
import { usePagamentosStore, useClientesStore } from '../store';
import { Plus, Edit2, Trash2, Search, DollarSign, Loader2, AlertCircle } from 'lucide-react';

export default function Pagamentos() {
  const { pagamentos, stats, loading, fetchPagamentos, fetchStats, adicionarPagamento, atualizarPagamento, deletarPagamento } = usePagamentosStore();
  const { clientes, fetchClientes } = useClientesStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState('');
  
  const [formulario, setFormulario] = useState({
    Descricao: '',
    Valor: '',
    Data: new Date().toLocaleDateString('en-CA'),
    Status: 'Pendente',
    FK_Cliente: ''
  });

  useEffect(() => {
    fetchPagamentos();
    fetchStats();
    fetchClientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmetendo(true);
    setErro('');

    // IMPACTO: Sanitização de dados para o MySQL
    const payload = {
      ...formulario,
      FK_Cliente: formulario.FK_Cliente === "" ? null : Number(formulario.FK_Cliente),
      Valor: parseFloat(formulario.Valor)
    };

    try {
      if (editando) {
        await atualizarPagamento(editando, payload);
      } else {
        await adicionarPagamento(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setErro("Falha na integridade dos dados. Verifique a conexão com o banco.");
    } finally {
      setSubmetendo(false);
    }
  };

  const handleAbrir = (pag = null) => {
    setErro('');
    if (pag) {
      setFormulario({ ...pag, FK_Cliente: pag.FK_Cliente || '' });
      setEditando(pag.ID);
    } else {
      setFormulario({ Descricao: '', Valor: '', Data: new Date().toLocaleDateString('en-CA'), Status: 'Pendente', FK_Cliente: '' });
      setEditando(null);
    }
    setModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fluxo Financeiro</h1>
          <p className="text-slate-400 mt-1">Gestão de receitas e vínculos com clientes.</p>
        </div>
        <button 
          onClick={() => handleAbrir()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Novo Lançamento
        </button>
      </div>

      {/* Cards de Stats com Impacto Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-md">
          <p className="text-slate-400 text-sm font-medium">Total Previsto</p>
          <h2 className="text-2xl font-bold text-white mt-2">R$ {Number(stats?.total_valor || 0).toLocaleString('pt-BR')}</h2>
        </div>
        {/* ... outros stats ... */}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">{editando ? 'Atualizar Registro' : 'Novo Pagamento'}</h2>
            
            {erro && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle size={18} /> {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vincular Cliente</label>
                  <select
                    value={formulario.FK_Cliente}
                    onChange={(e) => setFormulario({ ...formulario, FK_Cliente: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  >
                    <option value="">Nenhum (Cliente Avulso)</option>
                    {clientes.map(c => <option key={c.ID} value={c.ID}>{c.Empresa}</option>)}
                  </select>
                </div>
                
                {/* Inputs de Descrição e Valor seguem o mesmo padrão visual */}
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={submetendo}
                  className="flex-2 px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {submetendo ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}