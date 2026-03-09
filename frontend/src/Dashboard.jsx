import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientesStore, useTarefasStore, useCampanhasStore, useJobsStore, usePagamentosStore, useAuthStore } from './store';
import { Users, CheckSquare, DollarSign, TrendingUp, Megaphone, Briefcase } from 'lucide-react';
import { theme } from './theme';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const nav = useNavigate();
  const { usuario } = useAuthStore();
  const { clientes: cRaw, fetchClientes } = useClientesStore();
  const { tarefas: tRaw, fetchTarefas } = useTarefasStore();
  const { campanhas: caRaw, fetchCampanhas } = useCampanhasStore();
  const { jobs: jRaw, fetchJobs } = useJobsStore();
  const { stats, fetchStats } = usePagamentosStore();

  const cl = Array.isArray(cRaw) ? cRaw : [];
  const ta = Array.isArray(tRaw) ? tRaw : [];
  const ca = Array.isArray(caRaw) ? caRaw : [];
  const jo = Array.isArray(jRaw) ? jRaw : [];

  useEffect(() => {
    fetchClientes(); fetchTarefas(); fetchCampanhas();
    fetchJobs(); fetchStats();
  }, []);

  const cards = [
    { t: 'Clientes',    v: cl.length,                                       i: Users,      bg: 'bg-cyan-500/10 text-cyan-400',     path: '/clientes' },
    { t: 'Campanhas',   v: ca.length,                                       i: Megaphone,  bg: 'bg-purple-500/10 text-purple-400', path: '/campanhas' },
    { t: 'Jobs',        v: jo.filter(j => j.Status !== 'Concluído').length, i: Briefcase,  bg: 'bg-blue-500/10 text-blue-400',     path: '/jobs' },
    { t: 'Tarefas',     v: ta.filter(t => t.Status !== 'Concluído').length, i: CheckSquare,bg: 'bg-amber-500/10 text-amber-400',   path: '/tarefas' },
    // FIX: total_geral não existe — usar total_valor (retorno real da API)
    { t: 'Faturamento', v: fmt(stats?.total_valor),                         i: TrendingUp, bg: 'bg-green-500/10 text-green-400',   path: '/pagamentos' },
    { t: 'Recebido',    v: fmt(stats?.total_pago),                          i: DollarSign, bg: 'bg-emerald-500/10 text-emerald-400', path: '/pagamentos' },
  ];

  return (
    <div className="p-6 space-y-8 text-white max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black">ZZO <span className="text-cyan-400">CREATIVE</span></h1>
        <p className="text-slate-400 text-sm">Olá, {usuario?.nome || 'Admin'}.</p>
      </div>

      {/* CARDS CLICÁVEIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div key={i} onClick={() => nav(card.path)}
            className={`${theme.card} p-5 cursor-pointer hover:border-slate-500 transition-all group`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase group-hover:text-slate-400 transition-colors">{card.t}</p>
                <h3 className="text-2xl font-black mt-1">{card.v}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                <card.i size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${theme.card} p-5`}>
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 uppercase tracking-widest text-slate-400">
            <Users size={16} className="text-cyan-400"/> Clientes
          </h2>
          <div className="space-y-2">
            {cl.slice(0, 4).map(c => (
              <div key={c.ID} onClick={() => nav(`/clientes/${c.ID}`)}
                className="p-3 bg-slate-700/30 rounded-xl flex justify-between text-sm cursor-pointer hover:bg-slate-700/60 transition-colors group">
                <span className="font-bold group-hover:text-cyan-400 transition-colors">{c.Empresa}</span>
                <span className="text-cyan-400 font-bold text-xs uppercase">{c.Status}</span>
              </div>
            ))}
            {cl.length === 0 && <p className={theme.empty}>Nenhum cliente</p>}
          </div>
        </div>

        <div className={`${theme.card} p-5`}>
          <h2 className="font-black text-sm mb-4 flex items-center gap-2 uppercase tracking-widest text-slate-400">
            <CheckSquare size={16} className="text-amber-400"/> Tarefas Pendentes
          </h2>
          <div className="space-y-2">
            {ta.filter(t => t.Status !== 'Concluído').slice(0, 4).map(t => (
              <div key={t.ID} onClick={() => nav('/tarefas')}
                className="p-3 bg-slate-700/30 rounded-xl flex justify-between text-sm cursor-pointer hover:bg-slate-700/60 transition-colors group">
                <span className="truncate mr-2 font-bold group-hover:text-amber-400 transition-colors">{t.Tarefa}</span>
                <span className={`font-black text-xs uppercase ${
                  t.Prioridade === 'Alta' ? 'text-red-400' :
                  t.Prioridade === 'Média' ? 'text-amber-400' : 'text-slate-400'}`}>{t.Prioridade}</span>
              </div>
            ))}
            {ta.filter(t => t.Status !== 'Concluído').length === 0 && <p className={theme.empty}>Nenhuma tarefa pendente</p>}
          </div>
        </div>
      </div>

      {/* ALERTA PENDENTE — FIX: guard para stats null */}
      {stats?.total_pendente > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex justify-between items-center">
          <span className="text-amber-400 font-bold text-sm">Pendente: {fmt(stats.total_pendente)}</span>
          <button onClick={() => nav('/pagamentos')} className="text-xs bg-amber-500 text-black px-3 py-1 rounded-lg font-black uppercase">Ver</button>
        </div>
      )}
    </div>
  );
}
