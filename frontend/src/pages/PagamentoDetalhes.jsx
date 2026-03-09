import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePagamentosStore } from '../store';
import { theme } from '../theme';
import { ChevronLeft, Calendar, DollarSign, Tag, Info, CheckCircle, Clock, Briefcase, Building2 } from 'lucide-react';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PagamentoDetalhes() {
  const { id } = useParams();
  const nav = useNavigate();
  // FIX: substituído mock hardcoded por dados reais da store
  const { pagamentos, fetchPagamentos } = usePagamentosStore();
  const [pagamento, setPagamento] = useState(null);

  useEffect(() => {
    fetchPagamentos();
  }, []);

  useEffect(() => {
    if (Array.isArray(pagamentos) && pagamentos.length > 0) {
      const found = pagamentos.find(p => String(p.ID) === id);
      setPagamento(found || null);
    }
  }, [pagamentos, id]);

  if (!pagamento) return (
    <div className="p-8 text-white font-black uppercase italic text-center">
      <Clock size={32} className="mx-auto mb-2 text-slate-600" />
      Carregando pagamento...
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto text-white font-sans space-y-6">
      <button onClick={() => nav(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
        <ChevronLeft size={14} /> Voltar
      </button>

      {/* HEADER */}
      <div className={`${theme.card} p-8`}>
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            {/* FIX: removido theme.badge (não existe) — usando classes inline */}
            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase border mb-2 inline-block ${
              pagamento.Status === 'Pago'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
            }`}>{pagamento.Status}</span>
            {/* FIX: removido theme.pageTitle (não existe) — usando classes inline */}
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-2">{pagamento.Descricao || 'Pagamento'}</h1>
          </div>
          <div className="text-right">
            {/* FIX: removido theme.label (não existe) */}
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Valor do Lançamento</p>
            <p className="text-3xl font-black text-emerald-400">{fmt(pagamento.Valor)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-slate-400"><Calendar size={18} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Data</p>
              <p className="text-sm font-bold">{pagamento.Data ? new Date(pagamento.Data).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-slate-400"><Briefcase size={18} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Job</p>
              <p className="text-sm font-bold">{pagamento.NomeJob || '---'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-slate-400"><Building2 size={18} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Cliente</p>
              <p className="text-sm font-bold">{pagamento.NomeCliente || '---'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPANHA */}
      {pagamento.NomeCampanha && (
        <div className={`${theme.card} p-6`}>
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Tag size={16} />
            {/* FIX: removido theme.cardTitle (não existe) */}
            <h2 className="text-sm font-black uppercase tracking-widest">Campanha</h2>
          </div>
          <p className="text-slate-300 font-bold">{pagamento.NomeCampanha}</p>
        </div>
      )}
    </div>
  );
}
