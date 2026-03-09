import React, { useState, useEffect } from 'react';
import { useAdminStore, useAuthStore } from '../store';
import { Plus, Trash2, Shield, User } from 'lucide-react';

export default function Administradores() {
  const { admins, loading, fetchAdmins, adicionarAdmin, deletarAdmin } = useAdminStore();
  const { usuario } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState({ Nome: '', Email: '', Senha: '' });

  useEffect(() => { fetchAdmins(); }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formulario.Nome || !formulario.Email || !formulario.Senha) {
      setErro('Todos os campos são obrigatórios');
      return;
    }
    const resultado = await adicionarAdmin(formulario);
    if (resultado.sucesso) {
      setModalOpen(false);
      setFormulario({ Nome: '', Email: '', Senha: '' });
      await fetchAdmins();
    } else {
      setErro(resultado.erro || 'Erro ao criar administrador');
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Deletar este administrador?')) {
      const resultado = await deletarAdmin(id);
      if (resultado.sucesso) await fetchAdmins();
      else alert(resultado.erro || 'Erro ao deletar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Administradores</h1>
          <p className="text-slate-400 mt-1">{admins.length} administrador{admins.length !== 1 ? 'es' : ''} cadastrado{admins.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setModalOpen(true); setErro(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg">
          <Plus size={20} /> Novo Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-400 col-span-3">Carregando...</p>
        ) : admins.length === 0 ? (
          <p className="text-slate-400 col-span-3 text-center py-8">Nenhum administrador encontrado</p>
        ) : (
          admins.map((admin) => (
            <div key={admin.ID} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-start justify-between hover:border-slate-600 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${admin.ID === usuario?.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-700 text-slate-400'}`}>
                  {admin.ID === usuario?.id ? <Shield size={20} /> : <User size={20} />}
                </div>
                <div>
                  <p className="text-white font-semibold">{admin.Nome}</p>
                  <p className="text-slate-400 text-sm">{admin.Email}</p>
                  {admin.ID === usuario?.id && (
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Você</span>
                  )}
                </div>
              </div>
              {admin.ID !== usuario?.id && (
                <button onClick={() => handleDeletar(admin.ID)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-red-400 hover:text-red-300">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Novo Administrador</h2>
            {erro && <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg mb-4"><p className="text-red-300 text-sm">{erro}</p></div>}
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Nome *</label>
                <input type="text" value={formulario.Nome}
                  onChange={(e) => setFormulario({ ...formulario, Nome: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Email *</label>
                <input type="email" value={formulario.Email}
                  onChange={(e) => setFormulario({ ...formulario, Email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Senha *</label>
                <input type="password" value={formulario.Senha}
                  onChange={(e) => setFormulario({ ...formulario, Senha: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  minLength={6} required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setModalOpen(false); setErro(''); }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancelar</button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium">Criar Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
