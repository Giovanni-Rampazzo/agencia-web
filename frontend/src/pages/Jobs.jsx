import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobsStore, useClientesStore, useCampanhasStore } from '../store';
import { Search, Briefcase, ChevronRight, Trash2 } from 'lucide-react';
import { theme } from '../theme';

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs: jRaw, fetchJobs, adicionarJob, deletarJob } = useJobsStore();
  const { clientes: cRaw, fetchClientes } = useClientesStore();
  const { campanhas: cpRaw, fetchCampanhas } = useCampanhasStore();

  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ Descricao: '', Status: 'Pendente', FK_Cliente: '', FK_Campanha: '' });

  const jobs = Array.isArray(jRaw) ? jRaw : [];
  const clientes = Array.isArray(cRaw) ? cRaw : [];
  const campanhas = Array.isArray(cpRaw) ? cpRaw : [];

  useEffect(() => { fetchJobs(); fetchClientes(); fetchCampanhas(); }, []);

  const filtrados = jobs.filter(j => j.Descricao?.toLowerCase().includes(busca.toLowerCase()));

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');
    const resultado = await adicionarJob(form);
    if (resultado?.sucesso) {
      setModalOpen(false);
      setForm({ Descricao: '', Status: 'Pendente', FK_Cliente: '', FK_Campanha: '' });
    } else {
      setErro(resultado?.erro || 'Erro ao criar job');
    }
  };

  const excluir = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Excluir este job?')) {
      await deletarJob(id);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Jobs</h1>
        <button onClick={() => setModalOpen(true)} className={theme.headerBtnCyan}>
          + Novo Job
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input type="text" placeholder="Buscar job..." className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 text-sm" onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(j => (
          <div key={j.ID} onClick={() => navigate('/jobs/' + j.ID)} className={`${theme.card} ${theme.cardHover} p-5 relative overflow-hidden hover:border-cyan-500`}>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => excluir(j.ID, e)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20 w-fit mb-4">
              <Briefcase size={22} />
            </div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors leading-tight">{j.Descricao}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{j.ClienteNome || j.NomeCliente || 'Cliente'}</p>
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
              <span className="text-[10px] font-black uppercase text-cyan-400">{j.Status}</span>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-600 text-sm font-bold uppercase italic">Nenhum job encontrado</div>
        )}
      </div>

      {modalOpen && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Novo Job</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <form onSubmit={handleSalvar} className="space-y-4">
              <input type="text" placeholder="Descrição *" required
                className={`${theme.input} focus:border-cyan-500`}
                value={form.Descricao} onChange={e => setForm({...form, Descricao: e.target.value})} />
              <select required className={`${theme.select} focus:border-cyan-500`}
                value={form.FK_Cliente} onChange={e => setForm({...form, FK_Cliente: e.target.value})}>
                <option value="">Selecionar Cliente *</option>
                {clientes.map(c => <option key={c.ID} value={c.ID}>{c.Empresa}</option>)}
              </select>
              <select className={theme.input}
                value={form.FK_Campanha} onChange={e => setForm({...form, FK_Campanha: e.target.value})}>
                <option value="">Vincular Campanha (Opcional)</option>
                {campanhas.map(cp => <option key={cp.ID} value={cp.ID}>{cp.Nome}</option>)}
              </select>
              <select className={theme.select}
                value={form.Status} onChange={e => setForm({...form, Status: e.target.value})}>
                <option value="Pendente">Pendente</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setModalOpen(false); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnCyan}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
