import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampanhasStore, useJobsStore } from '../store';
import { ArrowLeft, Megaphone, Briefcase, ChevronRight, Plus } from 'lucide-react';
import { theme } from '../theme';

export default function CampanhaDetalhes() {
  const { id } = useParams();
  const nav = useNavigate();
  const { campanhas, fetchCampanhas } = useCampanhasStore();
  const { jobs, fetchJobs, adicionarJob } = useJobsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ Descricao: '', Status: 'Pendente', FK_Campanha: id });

  // FIX: unificado em um único useEffect (antes havia React.useEffect misturado com useEffect)
  useEffect(() => {
    fetchCampanhas();
    fetchJobs();
  }, []);

  const campanha = (Array.isArray(campanhas) ? campanhas : []).find(c => String(c.ID) === id);
  const jobsDaCampanha = (Array.isArray(jobs) ? jobs : []).filter(j => String(j.FK_Campanha) === id);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    const resultado = await adicionarJob({ ...form, FK_Campanha: id });
    if (resultado?.sucesso) {
      setModalOpen(false);
      setForm({ Descricao: '', Status: 'Pendente', FK_Campanha: id });
    } else {
      setErro(resultado?.erro || 'Erro ao criar job');
    }
  };

  if (!campanha) return <div className="p-8 text-white uppercase font-black italic">Carregando detalhes...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-white font-sans">
      <button onClick={() => nav('/campanhas')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-bold text-[10px] uppercase transition-all">
        <ArrowLeft size={14} /> Voltar para Campanhas
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD DA CAMPANHA */}
        <div className={`${theme.card} p-6 h-fit`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-indigo-600/20 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <Megaphone size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{campanha.Nome}</h1>
              {/* FIX: padronizado para NomeCliente com fallback */}
              <p onClick={() => campanha.FK_Cliente && nav(`/clientes/${campanha.FK_Cliente}`)}
                className={`text-[10px] text-slate-500 font-black uppercase tracking-widest ${campanha.FK_Cliente ? 'cursor-pointer hover:text-cyan-400 transition-colors' : ''}`}>
                {campanha.NomeCliente || campanha.ClienteNome || 'Cliente Geral'}
              </p>
            </div>
          </div>
          <div className="space-y-3 border-t border-slate-700/50 pt-4 text-[10px] font-black uppercase">
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-indigo-400">{campanha.Status}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Início</span><span className="text-slate-300">{campanha.DataInicio || 'N/A'}</span></div>
          </div>
        </div>

        {/* JOBS VINCULADOS */}
        <div className={`lg:col-span-2 ${theme.card} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tighter">
              <Briefcase size={20} className="text-cyan-400" /> Jobs Vinculados
            </h2>
            <button onClick={() => setModalOpen(true)} className={theme.headerBtnCyan}>
              <Plus size={16} /> Novo Job
            </button>
          </div>

          <div className="space-y-3">
            {jobsDaCampanha.map(job => (
              <div key={job.ID} onClick={() => nav(`/jobs/${job.ID}`)}
                className={`p-4 ${theme.cardInner} flex justify-between items-center hover:border-cyan-500 cursor-pointer transition-all group`}>
                <div>
                  <p className="font-black uppercase text-sm group-hover:text-cyan-400 transition-colors italic">{job.Descricao}</p>
                  {/* FIX: NomeCliente padronizado */}
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{job.NomeCliente || '---'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase border ${
                    job.Status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                    job.Status === 'Em Andamento' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/20'}`}>{job.Status}</span>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
            {jobsDaCampanha.length === 0 && <p className="text-slate-600 text-[10px] font-black uppercase italic text-center py-8">Nenhum job nesta campanha</p>}
          </div>
        </div>
      </div>

      {/* MODAL NOVO JOB */}
      {modalOpen && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Novo Job</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-xs text-slate-500 font-bold uppercase">
              Cliente: <span className="text-slate-300">{campanha?.NomeCliente || campanha?.ClienteNome || 'Vinculado à campanha'}</span>
            </div>
            <form onSubmit={salvar} className="space-y-4">
              <input type="text" placeholder="Descrição *" required
                className={`${theme.input} focus:border-cyan-500`}
                value={form.Descricao} onChange={e => setForm({...form, Descricao: e.target.value})} />
              <select className={theme.input}
                value={form.Status} onChange={e => setForm({...form, Status: e.target.value})}>
                <option value="Pendente">Pendente</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setModalOpen(false); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnCyan}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
