import React, { useState, useEffect } from 'react';
import { usePagamentosStore, useJobsStore } from '../store';
import { Search, DollarSign, Trash2 } from 'lucide-react';
import { theme } from '../theme';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Pagamentos() {
  const { pagamentos: pR, stats, fetchPagamentos, fetchStats, adicionarPagamento, deletarPagamento } = usePagamentosStore();
  const { jobs: jR, fetchJobs } = useJobsStore();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ Descricao: '', Valor: '', Status: 'Pendente', FK_Job: '' });

  useEffect(() => { fetchPagamentos(); fetchStats(); fetchJobs(); }, []);

  const pgs = (Array.isArray(pR) ? pR : []).filter(p => (p.Descricao || '').toLowerCase().includes(q.toLowerCase()));
  const jobs = Array.isArray(jR) ? jR : [];

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    const resultado = await adicionarPagamento(form);
    if (resultado?.sucesso) {
      setOpen(false);
      setForm({ Descricao: '', Valor: '', Status: 'Pendente', FK_Job: '' });
      fetchStats();
    } else {
      setErro(resultado?.erro || 'Erro ao salvar pagamento');
    }
  };

  const excluir = async (id) => {
    if (window.confirm('Excluir este pagamento?')) {
      await deletarPagamento(id);
      fetchStats();
    }
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Financeiro</h1>
        <button onClick={() => setOpen(true)} className={theme.headerBtnEmerald}>
          + Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl">
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Recebido</p>
          <p className="text-2xl font-black text-white mt-1">{fmt(stats?.total_pago)}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl">
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">A Receber</p>
          <p className="text-2xl font-black text-white mt-1">{fmt(stats?.total_pendente)}</p>
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-slate-500" size={16} />
          <input type="text" placeholder="Filtrar pagamentos..." className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-emerald-500 text-sm" onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className={`${theme.card} overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {pgs.map(p => (
              <tr key={p.ID} className="hover:bg-slate-700/20 transition-colors group">
                <td className="p-4">
                  <p className="font-bold">{p.Descricao || 'Pagamento'}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black mt-0.5">{p.ClienteNome || p.JobDesc || '---'}</p>
                </td>
                <td className="p-4 font-black text-emerald-400">{fmt(p.Valor)}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${p.Status === 'Pago' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>{p.Status}</span>
                </td>
                <td className="p-4">
                  <button onClick={() => excluir(p.ID)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {pgs.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-600 text-sm font-bold uppercase italic">Nenhum registro encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Novo Pagamento</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <form onSubmit={salvar} className="space-y-4">
              <input type="text" placeholder="Descrição (ex: Parcela 01) *" required
                className={`${theme.input} focus:border-emerald-500`}
                value={form.Descricao} onChange={e => setForm({...form, Descricao: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Valor (R$) *" required
                  className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-emerald-500"
                  value={form.Valor} onChange={e => setForm({...form, Valor: e.target.value})} />
                <select className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  value={form.Status} onChange={e => setForm({...form, Status: e.target.value})}>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>
              <select className={theme.select}
                value={form.FK_Job} onChange={e => setForm({...form, FK_Job: e.target.value})}>
                <option value="">Vincular a um Job (Opcional)</option>
                {jobs.map(j => <option key={j.ID} value={j.ID}>{j.Descricao}</option>)}
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setOpen(false); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnEmerald}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
