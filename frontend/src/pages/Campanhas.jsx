import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampanhasStore, useClientesStore } from '../store';
import { Megaphone, Search, Trash2, Plus, Calendar } from 'lucide-react';
import { theme } from '../theme';

export default function Campanhas() {
  const nav = useNavigate();
  const { campanhas: cR, fetchCampanhas, adicionarCampanha, atualizarCampanha, deletarCampanha } = useCampanhasStore();
  const { clientes: clR, fetchClientes } = useClientesStore();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const hoje = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ Nome: '', Status: 'Ativa', FK_Cliente: '', DataInicio: hoje });

  useEffect(() => { fetchCampanhas(); fetchClientes(); }, []);

  const lista = (Array.isArray(cR) ? cR : []).filter(c =>
    c.Nome?.toLowerCase().includes(q.toLowerCase())
  );
  const clis = Array.isArray(clR) ? clR : [];

  const abrirNovo = () => {
    setEditando(null);
    setForm({ Nome: '', Status: 'Ativa', FK_Cliente: '', DataInicio: hoje });
    setErro('');
    setOpen(true);
  };

  const abrirEditar = (c, e) => {
    e.stopPropagation();
    setEditando(c.ID || c.id);
    setForm({
      Nome: c.Nome,
      Status: c.Status,
      FK_Cliente: c.FK_Cliente,
      DataInicio: c.DataInicio ? c.DataInicio.split('T')[0] : hoje
    });
    setErro('');
    setOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.FK_Cliente) { setErro('Selecione um cliente'); return; }
    const payload = { ...form, DataInicio: form.DataInicio ? form.DataInicio.split('T')[0] : null };
    const resultado = editando
      ? await atualizarCampanha(editando, payload)
      : await adicionarCampanha(payload);
    if (resultado?.sucesso) {
      setOpen(false);
      setEditando(null);
      setForm({ Nome: '', Status: 'Ativa', FK_Cliente: '', DataInicio: hoje });
      fetchCampanhas();
    } else {
      setErro(resultado?.erro || 'Erro ao salvar campanha');
    }
  };

  const excluir = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Deseja excluir esta campanha?')) {
      await deletarCampanha(id);
      fetchCampanhas();
    }
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Campanhas</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestão Estratégica</p>
        </div>
        <button onClick={abrirNovo} className={theme.headerBtnIndigo}>
          <Plus size={16} /> Nova Campanha
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input type="text" placeholder="Buscar campanha por nome..."
          className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-sm transition-all"
          onChange={e => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lista.map(c => (
          <div key={c.ID || c.id} onClick={() => nav(`/campanhas/${c.ID || c.id}`)}
            className={`${theme.card} ${theme.cardHover} p-6 relative hover:border-indigo-500 group`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                <Megaphone size={22} />
              </div>
            <div className="flex items-center gap-1">
              <button onClick={(e) => abrirEditar(c, e)}
                className="p-2 text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={(e) => excluir(c.ID || c.id, e)}
                className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16}/>
              </button>
            </div>
            </div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors leading-tight">
              {c.Nome}
            </h3>
            {/* FIX: server.js retorna NomeCliente — usar NomeCliente com fallback para ClienteNome */}
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">
              {c.NomeCliente || c.ClienteNome || 'Cliente não vinculado'}
            </p>
            <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 mt-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <Calendar size={12} className="text-indigo-500" /> {c.DataInicio || 'S/ Data'}
              </div>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${
                c.Status === 'Ativa'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-slate-700 text-slate-400 border-slate-600'
              }`}>{c.Status}</span>
            </div>
          </div>
        ))}
        {lista.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-600 text-sm font-bold uppercase italic">Nenhuma campanha encontrada</div>
        )}
      </div>

      {open && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">{editando ? 'Editar Campanha' : 'Lançar Campanha'}</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <form onSubmit={salvar} className="space-y-4">
              <input type="text" placeholder="Nome da Campanha *" required
                className={`${theme.input} focus:border-indigo-500`}
                value={form.Nome} onChange={e => setForm({...form, Nome: e.target.value})} />
              <select required className={`${theme.select} focus:border-indigo-500`}
                value={form.FK_Cliente} onChange={e => setForm({...form, FK_Cliente: e.target.value})}>
                <option value="">Selecionar Cliente *</option>
                {clis.map(cli => (
                  <option key={cli.ID || cli.id} value={cli.ID || cli.id}>{cli.Empresa}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Data Início</label>
                  <input type="date" className={`${theme.input} focus:border-indigo-500`}
                    value={form.DataInicio} onChange={e => setForm({...form, DataInicio: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Status</label>
                  <select className={`${theme.select} focus:border-indigo-500`}
                    value={form.Status} onChange={e => setForm({...form, Status: e.target.value})}>
                    <option value="Ativa">Ativa</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setOpen(false); setEditando(null); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnIndigo}>{editando ? 'Salvar' : 'Lançar Campanha'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
