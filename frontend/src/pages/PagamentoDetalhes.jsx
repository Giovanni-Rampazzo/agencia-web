import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePagamentosStore, useJobsStore } from '../store';
import { ArrowLeft, DollarSign, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import { theme } from '../theme';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PagamentoDetalhes() {
  const { id } = useParams();
  const nav = useNavigate();
  const { pagamentos, fetchPagamentos, atualizarPagamento } = usePagamentosStore();
  const { jobs, fetchJobs } = useJobsStore();

  useEffect(() => { fetchPagamentos(); fetchJobs(); }, []);

  const pagamento = (Array.isArray(pagamentos) ? pagamentos : []).find(p => String(p.ID) === id);
  const job = pagamento ? (Array.isArray(jobs) ? jobs : []).find(j => String(j.ID) === String(pagamento.FK_Job)) : null;

  const marcarPago = async () => {
    if (!pagamento) return;
    const novoStatus = pagamento.Status === 'Pago' ? 'Pendente' : 'Pago';
    await atualizarPagamento(pagamento.ID, { ...pagamento, Status: novoStatus });
    fetchPagamentos();
  };

  if (!pagamento) return <div className="p-8 text-white font-black uppercase italic tracking-tighter">Carregando...</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto text-white font-sans">
      <button onClick={() => nav(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-bold text-[10px] uppercase transition-all">
        <ArrowLeft size={14} /> Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD PRINCIPAL */}
        <div className={`lg:col-span-1 ${theme.card} p-6 h-fit space-y-4`}>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-600/20 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <DollarSign size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-tight">{pagamento.Descricao}</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{pagamento.ClienteNome || '---'}</p>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-4 space-y-3 text-[10px] font-black uppercase">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Valor</span>
              <span className="text-emerald-400 text-lg">{fmt(pagamento.Valor)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              <span className={pagamento.Status === 'Pago' ? 'text-emerald-400' : 'text-amber-400'}>{pagamento.Status}</span>
            </div>
            {pagamento.Data && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Data</span>
                <span className="text-slate-300">{new Date(pagamento.Data).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>

          <button
            onClick={marcarPago}
            className={`w-full py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
              pagamento.Status === 'Pago'
                ? 'bg-slate-700 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
            }`}
          >
            {pagamento.Status === 'Pago' ? <><Clock size={16}/> Marcar como Pendente</> : <><CheckCircle2 size={16}/> Marcar como Pago</>}
          </button>
        </div>

        {/* JOB VINCULADO */}
        <div className={`lg:col-span-2 ${theme.card} p-6`}>
          <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2 mb-6">
            <Briefcase size={18} className="text-cyan-400" /> Job Vinculado
          </h2>

          {job ? (
            <div
              onClick={() => nav(`/jobs/${job.ID}`)}
              className={`p-4 ${theme.cardInner} flex justify-between items-center hover:border-cyan-500 cursor-pointer transition-all group`}
            >
              <div>
                <p className="font-black uppercase text-sm group-hover:text-cyan-400 transition-colors italic">{job.Descricao}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                  {job.ClienteNome || '---'} {job.CampanhaNome ? `· ${job.CampanhaNome}` : ''}
                </p>
              </div>
              <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${
                job.Status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' :
                job.Status === 'Em Andamento' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-amber-500/20 text-amber-400'}`}>{job.Status}</span>
            </div>
          ) : (
            <p className="text-slate-600 text-[10px] font-black uppercase italic text-center py-8">
              Nenhum job vinculado a este pagamento
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
