import React, { useState, useEffect } from 'react';
import { useTarefasStore, useClientesStore } from '../store';
import { CheckSquare, Search, Trash2 } from 'lucide-react';
import { theme } from '../theme';

export default function Tarefas() {
  const { tarefas: tR, fetchTarefas, adicionarTarefa, atualizarTarefa, deletarTarefa } = useTarefasStore();
  const { clientes: clR, fetchClientes } = useClientesStore();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ Tarefa: '', Prioridade: 'Média', Status: 'Pendente', FK_Cliente: '' });

  useEffect(() => { fetchTarefas(); fetchClientes(); }, []);

  const lista = (Array.isArray(tR) ? tR : []).filter(t => t.Tarefa?.toLowerCase().includes(q.toLowerCase()));
  const clis = Array.isArray(clR) ? clR : [];

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    const resultado = await adicionarTarefa(form);
    if (resultado?.sucesso) {
      setOpen(false);
      setForm({ Tarefa: '', Prioridade: 'Média', Status: 'Pendente', FK_Cliente: '' });
    } else {
      setErro(resultado?.erro || 'Erro ao salvar tarefa');
    }
  };

  const alternarStatus = async (t) => {
    const novoStatus = t.Status === 'Concluído' ? 'Pendente' : 'Concluído';
    await atualizarTarefa(t.ID, { ...t, Status: novoStatus });
  };

  const excluir = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Excluir esta tarefa?')) {
      await deletarTarefa(id);
    }
  };

  const pendentes = lista.filter(t => t.Status !== 'Concluído');
  const concluidas = lista.filter(t => t.Status === 'Concluído');

  return (
    <div className="p-6 space-y-6 text-white max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Tarefas</h1>
        <button onClick={() => setOpen(true)} className={theme.headerBtnCyan}>
          + Nova Tarefa
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input type="text" placeholder="Buscar tarefa..." className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 text-sm" onChange={e => setQ(e.target.value)} />
      </div>

      {pendentes.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pendentes ({pendentes.length})</p>
          {pendentes.map(t => (
            <div key={t.ID} className={`${theme.card} p-4 flex items-center justify-between hover:border-slate-500 transition-all group`}>
              <div className="flex items-center gap-4">
                <button onClick={() => alternarStatus(t)} className="p-2 rounded-xl bg-slate-700 text-slate-500 hover:text-white hover:bg-cyan-600 transition-all">
                  <CheckSquare size={18} />
                </button>
                <div>
                  <p className="font-bold text-sm text-slate-100">{t.Tarefa}</p>
                  <p className="text-[9px] text-cyan-500 font-black uppercase tracking-widest mt-0.5">{t.ClienteNome || 'Geral'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${
                  t.Prioridade === 'Alta' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                  t.Prioridade === 'Média' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                  'border-slate-600 text-slate-400 bg-slate-700/30'}`}>{t.Prioridade}</span>
                <button onClick={(e) => excluir(t.ID, e)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {concluidas.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Concluídas ({concluidas.length})</p>
          {concluidas.map(t => (
            <div key={t.ID} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group opacity-60 hover:opacity-80 transition-all">
              <div className="flex items-center gap-4">
                <button onClick={() => alternarStatus(t)} className="p-2 rounded-xl bg-emerald-600 text-white transition-all">
                  <CheckSquare size={18} />
                </button>
                <p className="font-bold text-sm text-slate-500 line-through">{t.Tarefa}</p>
              </div>
              <button onClick={(e) => excluir(t.ID, e)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {lista.length === 0 && (
        <div className="text-center py-12 text-slate-600 text-sm font-bold uppercase italic">Nenhuma tarefa encontrada</div>
      )}

      {open && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Nova Tarefa</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <form onSubmit={salvar} className="space-y-4">
              <input type="text" placeholder="O que precisa ser feito? *" required
                className={`${theme.input} focus:border-cyan-500`}
                value={form.Tarefa} onChange={e => setForm({...form, Tarefa: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <select className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  value={form.Prioridade} onChange={e => setForm({...form, Prioridade: e.target.value})}>
                  <option value="Alta">Prioridade: Alta</option>
                  <option value="Média">Prioridade: Média</option>
                  <option value="Baixa">Prioridade: Baixa</option>
                </select>
                <select className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  value={form.FK_Cliente} onChange={e => setForm({...form, FK_Cliente: e.target.value})}>
                  <option value="">Vincular Cliente...</option>
                  {clis.map(c => <option key={c.ID} value={c.ID}>{c.Empresa}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setOpen(false); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnCyan}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
