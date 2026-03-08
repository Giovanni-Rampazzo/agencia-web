import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Users, CheckSquare, Briefcase, DollarSign, LogOut, Menu, X, Megaphone } from 'lucide-react';
import { useAuthStore } from '../store';
import { theme } from '../theme';

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuthStore();

  const menu = [
    { label: 'Dashboard',  icon: BarChart3,   path: '/dashboard' },
    { label: 'Clientes',   icon: Users,       path: '/clientes' },
    { label: 'Campanhas',  icon: Megaphone,   path: '/campanhas' },
    { label: 'Jobs',       icon: Briefcase,   path: '/jobs' },
    { label: 'Pagamentos', icon: DollarSign,  path: '/pagamentos' },
    { label: 'Tarefas',    icon: CheckSquare, path: '/tarefas' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className={`${open ? 'w-64' : 'w-20'} bg-slate-950 border-r border-slate-800 transition-all flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {open && (
            <span className="text-xl font-black text-white tracking-tighter">
              ZZO <span className="text-cyan-400">CREATIVE</span>
            </span>
          )}
          <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-white transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menu.map((item) => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                  ${active ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <item.icon size={20} />
                {open && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {open && (
            <div className="mb-4 px-2">
              <p className="text-[10px] font-black text-slate-500 uppercase">Administrador</p>
              <p className="text-sm font-bold text-slate-200 truncate">{usuario?.nome || usuario?.Nome || 'Admin'}</p>
            </div>
          )}
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold text-xs">
            <LogOut size={16} /> {open && 'SAIR'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-900">
        {children}
      </main>
    </div>
  );
}
