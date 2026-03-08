import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientesStore } from '../store';
import { Search, Building2, Mail, Phone, Trash2 } from 'lucide-react';
import { theme } from '../theme';

export default function Clientes() {
  const nav = useNavigate();
  const { clientes: cR, fetchClientes, adicionarCliente, deletarCliente } = useClientesStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ Empresa: '', Email: '', Telefone: '', Status: 'Ativo', Endereco: '' });

  useEffect(() => { fetchClientes(); }, []);

  const lista = (Array.isArray(cR) ? cR : []).filter(c =>
    c.Empresa.toLowerCase().includes(q.toLowerCase()) ||
    (c.Email && c.Email.toLowerCase().includes(q.toLowerCase()))
  );

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    const resultado = await adicionarCliente(form);
    if (resultado?.sucesso) {
      setOpen(false);
      setForm({ Empresa: '', Email: '', Telefone: '', Status: 'Ativo', Endereco: '' });
    } else {
      setErro(resultado?.erro || 'Erro ao salvar cliente');
    }
  };

  const excluir = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Excluir este cliente e todos os seus dados?')) {
      await deletarCliente(id);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Clientes</h1>
        <button onClick={() => setOpen(true)} className={theme.headerBtnCyan}>
          + Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input type="text" placeholder="Buscar empresa ou email..." className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 text-sm" onChange={e => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lista.map(c => (
          <div key={c.ID} onClick={() => nav(`/clientes/${c.ID}`)} className={`${theme.card} ${theme.cardHover} p-5 relative overflow-hidden hover:border-cyan-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => excluir(c.ID, e)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-slate-900 rounded-2xl text-cyan-400 border border-slate-700"><Building2 size={24} /></div>
              <div>
                <h3 className="font-black text-lg leading-tight group-hover:text-cyan-400 transition-colors uppercase italic">{c.Empresa}</h3>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${c.Status === 'Ativo' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-slate-600 text-slate-500 bg-slate-700/30'}`}>{c.Status}</span>
              </div>
            </div>
            <div className="space-y-2 border-t border-slate-700/50 pt-4 text-xs text-slate-400 font-bold">
              <div className="flex items-center gap-2"><Mail size={14} className="text-slate-600" /> {c.Email || '---'}</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-slate-600" /> {c.Telefone || '---'}</div>
            </div>
          </div>
        ))}
        {lista.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-600 text-sm font-bold uppercase italic">Nenhum cliente encontrado</div>
        )}
      </div>

      {open && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Novo Cliente</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <form onSubmit={salvar} className="space-y-4">
              <input type="text" placeholder="Nome da Empresa *" required
                className={`${theme.input} focus:border-cyan-500`}
                value={form.Empresa} onChange={e => setForm({...form, Empresa: e.target.value})} />
              <input type="email" placeholder="Email"
                className={`${theme.input} focus:border-cyan-500`}
                value={form.Email} onChange={e => setForm({...form, Email: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Telefone"
                  className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none"
                  value={form.Telefone} onChange={e => setForm({...form, Telefone: e.target.value})} />
                <select className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  value={form.Status} onChange={e => setForm({...form, Status: e.target.value})}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <input type="text" placeholder="Endereço"
                className={theme.input}
                value={form.Endereco} onChange={e => setForm({...form, Endereco: e.target.value})} />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setOpen(false); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnCyan}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
