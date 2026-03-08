import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Loader2 } from 'lucide-react';
import { theme } from './theme';

export default function Login() {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    const resultado = await login(email, senha);
    if (resultado.sucesso) {
      navigate('/dashboard');
    } else {
      setErro(resultado.erro || 'Credenciais inválidas');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-10 w-full max-w-md shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Agência
          </h1>
          <p className="text-slate-400 mt-2">Acesse o painel de gestão</p>
        </div>

        {erro && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zzo.com" required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={20} className="animate-spin" /> Entrando...</> : 'Aceder ao Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}
