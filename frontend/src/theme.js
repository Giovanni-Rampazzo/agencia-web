// ============================================================
//  THEME.JS — Estilos centralizados do sistema ZZO
//  Edite aqui para mudar o visual em todas as páginas
// ============================================================

export const theme = {
  // CARDS
  card:        'bg-slate-800 border border-slate-700 rounded-3xl shadow-md shadow-black/30',
  cardHover:   'hover:border-cyan-500 transition-all cursor-pointer group',
  cardInner:   'bg-slate-900/40 border border-slate-700 rounded-2xl',

  // MODAIS
  overlay:  'fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4',
  modal:    'bg-slate-800 p-6 rounded-3xl w-full max-w-md border border-slate-700 shadow-md shadow-black/30',

  // INPUTS
  input:   'w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none',
  select:  'w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none',

  // BOTÕES — modal (flex-1)
  btnCancel:   'flex-1 p-3 bg-slate-700 rounded-xl font-bold text-xs uppercase hover:bg-slate-600 transition-colors',
  btnCyan:     'flex-1 p-3 bg-cyan-600 rounded-xl font-bold text-xs uppercase hover:bg-cyan-700 transition-colors',
  btnIndigo:   'flex-1 p-3 bg-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-colors',
  btnEmerald:  'flex-1 p-3 bg-emerald-600 rounded-xl font-bold text-xs uppercase hover:bg-emerald-700 transition-colors',

  // BOTÕES — header (topo das páginas)
  headerBtnCyan:    'bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all shadow-sm shadow-cyan-900/10 flex items-center gap-2',
  headerBtnIndigo:  'bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all shadow-sm shadow-indigo-900/10 flex items-center gap-2',
  headerBtnEmerald: 'bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all shadow-sm shadow-emerald-900/10 flex items-center gap-2',

  // TIPOGRAFIA
  pageTitle:  'text-2xl font-black italic tracking-tighter uppercase',
  cardTitle:  'text-lg font-black italic uppercase tracking-tighter',
  label:      'text-xs font-black uppercase tracking-widest text-slate-500',
  empty:      'text-slate-600 text-xs font-black uppercase italic text-center py-8',

  // BADGES STATUS
  badge: {
    ativo:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    inativo:   'bg-red-500/20 text-red-400 border border-red-500/20',
    pendente:  'bg-amber-500/20 text-amber-400 border border-amber-500/20',
    andamento: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20',
    concluido: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    pago:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
  },

  // ERRO
  erro: 'mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm',
};