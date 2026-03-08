import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobsStore, useTarefasStore, usePagamentosStore } from '../store';
import { ArrowLeft, Briefcase, CheckCircle2, DollarSign, Plus, ChevronRight } from 'lucide-react';
import { theme } from '../theme';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function JobDetalhes() {
  const { id } = useParams();
  const nav = useNavigate();
  const { jobs, fetchJobs } = useJobsStore();
  const { tarefas, fetchTarefas, adicionarTarefa } = useTarefasStore();
  const { pagamentos, fetchPagamentos, adicionarPagamento } = usePagamentosStore();

  const [modalT, setModalT] = useState(false);
  const [modalP, setModalP] = useState(false);
  const [nT, setNT] = useState({ Tarefa: '', Prioridade: 'Média' });
  const [nP, setNP] = useState({ Descricao: '', Valor: '', Data: '', Status: 'Pendente' });
  const [erroT, setErroT] = useState('');
  const [erroP, setErroP] = useState('');

  useEffect(() => { fetchJobs(); fetchTarefas(); fetchPagamentos(); }, []);

  const job = (Array.isArray(jobs) ? jobs : []).find(j => String(j.ID) === id);
  const tas = (Array.isArray(tarefas) ? tarefas : []).filter(t => String(t.FK_Job) === id);
  const pgs = (Array.isArray(pagamentos) ? pagamentos : []).filter(p => String(p.FK_Job) === id);

  const salvarT = async (e) => {
    e.preventDefault();
    setErroT('');
    const resultado = await adicionarTarefa({ ...nT, FK_Job: id, FK_Cliente: job?.FK_Cliente, Status: 'Pendente' });
    if (resultado?.sucesso) {
      setModalT(false);
      setNT({ Tarefa: '', Prioridade: 'Média' });
    } else {
      setErroT(resultado?.erro || 'Erro ao criar tarefa');
    }
  };

  const salvarP = async (e) => {
    e.preventDefault();
    setErroP('');
    const resultado = await adicionarPagamento({ ...nP, FK_Job: id, FK_Cliente: job?.FK_Cliente });
    if (resultado?.sucesso) {
      setModalP(false);
      setNP({ Descricao: '', Valor: '', Data: '', Status: 'Pendente' });
    } else {
      setErroP(resultado?.erro || 'Erro ao lançar pagamento');
    }
  };

  if (!job) return <div className="p-8 text-white font-black uppercase tracking-tighter italic">Carregando...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-white font-sans">
      <button onClick={() => nav('/jobs')} className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 font-bold text-[10px] uppercase transition-all">
        <ArrowLeft size={14} /> Voltar para Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INFO DO JOB */}
        <div className={`${theme.card} p-6 h-fit`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-600/20 rounded-2xl text-cyan-400 border border-cyan-500/20">
              <Briefcase size={24}/>
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase leading-tight tracking-tighter">{job.Descricao}</h1>
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{job.ClienteNome || '---'}</p>
            </div>
          </div>
          <div className="space-y-3 border-t border-slate-700/50 pt-4 text-[10px] font-black uppercase">
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-cyan-400">{job.Status}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Campanha</span>
              {job.FK_Campanha ? (
                <span onClick={() => nav(`/campanhas/${job.FK_Campanha}`)} className="text-indigo-400 cursor-pointer hover:underline italic">{job.CampanhaNome || 'Ver'}</span>
              ) : (
                <span className="text-slate-600 italic">N/A</span>
              )}
            </div>
            <div className="flex justify-between"><span className="text-slate-500">Cliente</span>
              <span onClick={() => nav(`/clientes/${job.FK_Cliente}`)} className="text-cyan-400 cursor-pointer hover:underline italic">{job.ClienteNome || 'Ver'}</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAREFAS */}
          <div className={`${theme.card} p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tighter">
                <CheckCircle2 size={18} className="text-cyan-400" /> Tarefas
              </h2>
              <button onClick={() => setModalT(true)} className="p-2 bg-cyan-600 rounded-xl hover:bg-cyan-500 text-white transition-all shadow-sm shadow-cyan-900/10"><Plus size={16}/></button>
            </div>
            <div className="space-y-2">
              {tas.map(t => (
                <div key={t.ID} className="p-3 bg-slate-900/50 border border-slate-700 rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-200">{t.Tarefa}</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${
                    t.Status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                    'bg-slate-700 text-slate-400 border-slate-600'}`}>{t.Status}</span>
                </div>
              ))}
              {tas.length === 0 && <p className="text-slate-600 text-center py-4 text-[10px] font-bold uppercase italic">Nenhuma tarefa neste job</p>}
            </div>
          </div>

          {/* FINANCEIRO */}
          <div className={`${theme.card} p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tighter">
                <DollarSign size={18} className="text-emerald-400" /> Financeiro
              </h2>
              <button onClick={() => setModalP(true)} className="p-2 bg-emerald-600 rounded-xl hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-900/10"><Plus size={16}/></button>
            </div>
            <div className="space-y-2">
              {pgs.map(p => (
                <div
                  key={p.ID}
                  onClick={() => nav(`/pagamentos/${p.ID}`)}
                  className="p-3 bg-slate-900/30 border border-slate-700 rounded-2xl flex justify-between items-center hover:border-emerald-500 cursor-pointer transition-all group"
                >
                  <div>
                    <p className="font-black text-sm group-hover:text-emerald-400 transition-colors italic">{p.Descricao || 'Pagamento'}</p>
                    <p className="text-emerald-400 font-black text-sm">{fmt(p.Valor)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${
                      p.Status === 'Pago' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{p.Status}</span>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
              {pgs.length === 0 && <p className="text-slate-600 text-center py-4 text-[10px] font-bold uppercase italic">Sem registros financeiros</p>}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAREFA */}
      {modalT && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Nova Tarefa</h2>
            {erroT && <div className={theme.erro}>{erroT}</div>}
            <form onSubmit={salvarT} className="space-y-4">
              <input type="text" placeholder="O que fazer? *" required
                className={`${theme.input} focus:border-cyan-500`}
                value={nT.Tarefa} onChange={e => setNT({...nT, Tarefa: e.target.value})} />
              <select className={theme.select}
                value={nT.Prioridade} onChange={e => setNT({...nT, Prioridade: e.target.value})}>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setModalT(false); setErroT(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnCyan}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGAMENTO */}
      {modalP && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Lançar Pagamento</h2>
            {erroP && <div className={theme.erro}>{erroP}</div>}
            <form onSubmit={salvarP} className="space-y-4">
              <input type="text" placeholder="Ex: Parcela 01 *" required
                className={`${theme.input} focus:border-emerald-500`}
                value={nP.Descricao} onChange={e => setNP({...nP, Descricao: e.target.value})} />
              <input type="date" required
                className={`${theme.input} focus:border-emerald-500`}
                value={nP.Data} onChange={e => setNP({...nP, Data: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Valor (R$) *" required
                  className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-emerald-500"
                  value={nP.Valor} onChange={e => setNP({...nP, Valor: e.target.value})} />
                <select className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  value={nP.Status} onChange={e => setNP({...nP, Status: e.target.value})}>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setModalP(false); setErroP(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnEmerald}>Lançar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
