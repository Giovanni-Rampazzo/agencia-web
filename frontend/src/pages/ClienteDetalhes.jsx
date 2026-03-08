import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientesStore, useCampanhasStore } from '../store';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Megaphone, Plus, ChevronRight } from 'lucide-react';
import { theme } from '../theme';

export default function ClienteDetalhes() {
  const { id } = useParams();
  const nav = useNavigate();
  const { clientes, fetchClientes } = useClientesStore();
  const { campanhas: campanhasRaw, fetchCampanhas, adicionarCampanha } = useCampanhasStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ Nome: '', Status: 'Ativa', DataInicio: '', FK_Cliente: id });

  useEffect(() => { fetchClientes(); fetchCampanhas(); }, []);

  const cliente = (Array.isArray(clientes) ? clientes : []).find(c => String(c.ID) === id);
  const campanhasDoCliente = (Array.isArray(campanhasRaw) ? campanhasRaw : []).filter(ca => String(ca.FK_Cliente) === id);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    const resultado = await adicionarCampanha({ ...form, FK_Cliente: id });
    if (resultado?.sucesso) {
      setModalOpen(false);
      setForm({ Nome: '', Status: 'Ativa', DataInicio: '', FK_Cliente: id });
    } else {
      setErro(resultado?.erro || 'Erro ao salvar.');
    }
  };

  if (!cliente) return <div className="p-8 text-white font-black uppercase italic">Carregando...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-white font-sans">
      <button onClick={() => nav('/clientes')} className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 font-bold text-[10px] uppercase transition-all">
        <ArrowLeft size={14} /> Voltar para Clientes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD DO CLIENTE */}
        <div className={`${theme.card} p-6 h-fit`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-cyan-600/20 rounded-2xl text-cyan-400 border border-cyan-500/20">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{cliente.Empresa}</h1>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border mt-1 inline-block ${
                cliente.Status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                'bg-slate-700 text-slate-400 border-slate-600'}`}>{cliente.Status}</span>
            </div>
          </div>
          <div className="space-y-3 border-t border-slate-700/50 pt-4 text-sm text-slate-400">
            {cliente.Email    && <div className="flex items-center gap-2"><Mail size={14}/> {cliente.Email}</div>}
            {cliente.Telefone && <div className="flex items-center gap-2"><Phone size={14}/> {cliente.Telefone}</div>}
            {cliente.Endereco && <div className="flex items-center gap-2"><MapPin size={14}/> {cliente.Endereco}</div>}
          </div>
        </div>

        {/* CAMPANHAS */}
        <div className={`lg:col-span-2 ${theme.card} p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tighter">
              <Megaphone size={20} className="text-indigo-400" /> Campanhas
            </h2>
            <button onClick={() => setModalOpen(true)} className={theme.headerBtnIndigo}>
              <Plus size={16} /> Nova Campanha
            </button>
          </div>

          <div className="space-y-3">
            {campanhasDoCliente.map(ca => (
              <div key={ca.ID} onClick={() => nav(`/campanhas/${ca.ID}`)}
                className={`p-4 ${theme.cardInner} flex justify-between items-center hover:border-indigo-500 cursor-pointer transition-all group`}>
                <div>
                  <p className="font-black uppercase text-sm group-hover:text-indigo-400 transition-colors italic">{ca.Nome}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{ca.Status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{ca.DataInicio ? new Date(ca.DataInicio).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))}
            {campanhasDoCliente.length === 0 && <p className="text-slate-600 text-[10px] font-black uppercase italic text-center py-8">Nenhuma campanha neste cliente</p>}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className={theme.overlay}>
          <div className={theme.modal}>
            <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Nova Campanha</h2>
            {erro && <div className={theme.erro}>{erro}</div>}
            <form onSubmit={salvar} className="space-y-4">
              <input type="text" placeholder="Nome da campanha *" required
                className={`${theme.input} focus:border-indigo-500`}
                value={form.Nome} onChange={e => setForm({...form, Nome: e.target.value})} />
              <input type="date"
                className={`${theme.input} focus:border-indigo-500`}
                value={form.DataInicio} onChange={e => setForm({...form, DataInicio: e.target.value})} />
              <select className={theme.input}
                value={form.Status} onChange={e => setForm({...form, Status: e.target.value})}>
                <option value="Ativa">Ativa</option>
                <option value="Pausada">Pausada</option>
                <option value="Encerrada">Encerrada</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { setModalOpen(false); setErro(''); }} className={theme.btnCancel}>Cancelar</button>
                <button type="submit" className={theme.btnIndigo}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
