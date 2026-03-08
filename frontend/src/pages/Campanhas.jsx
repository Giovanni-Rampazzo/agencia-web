import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampanhasStore, useClientesStore } from '../store';
import { Megaphone, Search, Trash2, Plus, Calendar } from 'lucide-react';
import { theme } from '../theme';

export default function Campanhas() {
  const nav = useNavigate();
  const { campanhas: cR, fetchCampanhas, adicionarCampanha, deletarCampanha } = useCampanhasStore();
  const { clientes: clR, fetchClientes } = useClientesStore();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState('');
  
  // Define a data de hoje como padrão no formato YYYY-MM-DD
  const hoje = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ 
    Nome: '', 
    Status: 'Ativa', 
    FK_Cliente: '', 
    DataInicio: hoje 
  });

  useEffect(() => { 
    fetchCampanhas(); 
    fetchClientes(); 
  }, []);

  const lista = (Array.isArray(cR) ? cR : []).filter(c => 
    c.Nome?.toLowerCase().includes(q.toLowerCase())
  );
  
  const clis = Array.isArray(clR) ? clR : [];

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    
    // Pequena validação de segurança
    if (!form.FK_Cliente) {
      setErro('Selecione um cliente obrigatório');
      return;
    }

    const resultado = await adicionarCampanha(form);
    if (resultado?.sucesso || resultado === true) {
      setOpen(false);
      setForm({ Nome: '', Status: 'Ativa', FK_Cliente: '', DataInicio: hoje });
      fetchCampanhas(); // Recarrega a lista
    } else {
      setErro(resultado?.erro || 'Erro ao salvar campanha');
    }
  };

  const excluir = async (id, e) => {
    e.stopPropagation(); // Impede abrir detalhes ao clicar no lixo
    if (window.confirm('Deseja excluir esta campanha?')) {
      await deletarCampanha(id);
      fetchCampanhas();
    }
  };

  return (
    <div className="p-6 space-y-6 text-white max-w-7xl mx-auto font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Campanhas</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestão Estratégica</p>
        </div>
        <button 
          onClick={() => setOpen(true)} 
          className={theme.headerBtnIndigo}
        >
          <Plus size={16} /> Nova Campanha
        </button>
      </div>

      {/* BUSCA */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Buscar campanha por nome..." 
          className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-sm transition-all"
          onChange={e => setQ(e.target.value)} 
        />
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lista.map(c => (
          <div 
            key={c.ID || c.id} 
            onClick={() => {
              const targetId = c.ID || c.id;
              nav(`/campanhas/${targetId}`);
            }} 
            className={`${theme.card} ${theme.cardHover} p-6 relative hover:border-indigo-500`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                <Megaphone size={22} />
              </div>
              <button 
                onClick={(e) => excluir(c.ID || c.id, e)} 
                className="p-2 text-slate-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16}/>
              </button>
            </div>

            <h3 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors leading-tight">
              {c.Nome}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">
              {c.ClienteNome || 'Cliente não vinculado'}
            </p>
            
            <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4 mt-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <Calendar size={12} className="text-indigo-500" /> {c.DataInicio || 'S/ Data'}
              </div>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${
                c.Status === 'Ativa' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-slate-700 text-slate-400 border-slate-600'
              }`}>
                {c.Status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CADASTRO */}
      {open && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Lançar Campanha</h2>
            
            {erro && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase rounded-xl text-center">{erro}</div>}

            <form onSubmit={salvar} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nome da Campanha" 
                required 
                className={`${theme.input} focus:border-indigo-500`}
                value={form.Nome} 
                onChange={e => setForm({...form, Nome: e.target.value})} 
              />
              
              <select 
                required 
                className={`${theme.select} focus:border-indigo-500`}
                value={form.FK_Cliente} 
                onChange={e => setForm({...form, FK_Cliente: e.target.value})}
              >
                <option value="">Selecionar Cliente *</option>
                {clis.map(cli => (
                  <option key={cli.ID || cli.id} value={cli.ID || cli.id}>{cli.Empresa}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Data Início</label>
                  <input 
                    type="date" 
                    className={`${theme.input} focus:border-indigo-500`}
                    value={form.DataInicio} 
                    onChange={e => setForm({...form, DataInicio: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Status</label>
                  <select 
                    className={`${theme.select} focus:border-indigo-500`}
                    value={form.Status} 
                    onChange={e => setForm({...form, Status: e.target.value})}
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setOpen(false); setErro(''); }} 
                  className={theme.btnCancel}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={theme.btnIndigo}
                >
                  Lançar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}