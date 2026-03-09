import { create } from 'zustand';
import api from './api';

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  usuario: null,
  token: localStorage.getItem('token') || null,
  loading: false,

  login: async (email, senha) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', data.token);
      set({ usuario: data.usuario, token: data.token, loading: false });
      return { sucesso: true };
    } catch (error) {
      set({ loading: false });
      return { sucesso: false, erro: error.response?.data?.erro || 'Erro ao fazer login' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ usuario: null, token: null });
  },

  // FIX: decodifica o JWT para recuperar dados do usuário após refresh
  carregarUsuario: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        set({ token, usuario: { id: payload.id, nome: payload.nome, email: payload.email } });
      } catch {
        set({ token });
      }
    }
  }
}));

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export const useClientesStore = create((set) => ({
  clientes: [],
  loading: false,

  fetchClientes: async (status = null) => {
    set({ loading: true });
    try {
      const params = status ? { status } : {};
      const { data } = await api.get('/clientes', { params });
      set({ clientes: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  adicionarCliente: async (cliente) => {
    try {
      await api.post('/clientes', cliente);
      const { data } = await api.get('/clientes');
      set({ clientes: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  atualizarCliente: async (id, cliente) => {
    try {
      await api.put(`/clientes/${id}`, cliente);
      const { data } = await api.get('/clientes');
      set({ clientes: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  deletarCliente: async (id) => {
    try {
      await api.delete(`/clientes/${id}`);
      const { data } = await api.get('/clientes');
      set({ clientes: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  }
}));

// ─── CAMPANHAS ───────────────────────────────────────────────────────────────
// FIX: store de campanhas criada do zero (estava completamente ausente)
export const useCampanhasStore = create((set) => ({
  campanhas: [],
  loading: false,

  fetchCampanhas: async (cliente_id = null) => {
    set({ loading: true });
    try {
      const params = cliente_id ? { cliente_id } : {};
      const { data } = await api.get('/campanhas', { params });
      set({ campanhas: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  adicionarCampanha: async (campanha) => {
    try {
      await api.post('/campanhas', campanha);
      const { data } = await api.get('/campanhas');
      set({ campanhas: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  atualizarCampanha: async (id, campanha) => {
    try {
      await api.put(`/campanhas/${id}`, campanha);
      const { data } = await api.get('/campanhas');
      set({ campanhas: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  deletarCampanha: async (id) => {
    try {
      await api.delete(`/campanhas/${id}`);
      const { data } = await api.get('/campanhas');
      set({ campanhas: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  }
}));

// ─── TAREFAS ─────────────────────────────────────────────────────────────────
export const useTarefasStore = create((set) => ({
  tarefas: [],
  loading: false,

  fetchTarefas: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/tarefas');
      set({ tarefas: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  adicionarTarefa: async (tarefa) => {
    try {
      await api.post('/tarefas', tarefa);
      const { data } = await api.get('/tarefas');
      set({ tarefas: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  atualizarTarefa: async (id, tarefa) => {
    try {
      // FIX: envia apenas os campos que o backend espera
      const { Tarefa, Prioridade, Prazo, Status, FK_Job, FK_Cliente } = tarefa;
      await api.put(`/tarefas/${id}`, { Tarefa, Prioridade, Prazo: Prazo || null, Status, FK_Job: FK_Job || null, FK_Cliente: FK_Cliente || null });
      const { data } = await api.get('/tarefas');
      set({ tarefas: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  deletarTarefa: async (id) => {
    try {
      await api.delete(`/tarefas/${id}`);
      const { data } = await api.get('/tarefas');
      set({ tarefas: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  }
}));

// ─── JOBS ────────────────────────────────────────────────────────────────────
export const useJobsStore = create((set) => ({
  jobs: [],
  loading: false,

  fetchJobs: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/jobs');
      set({ jobs: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  adicionarJob: async (job) => {
    try {
      // FIX: envia apenas FK_Campanha (modelo SaaS — cliente vem pelo join da campanha)
      const { Descricao, Status, FK_Campanha } = job;
      await api.post('/jobs', { Descricao, Status, FK_Campanha });
      const { data } = await api.get('/jobs');
      set({ jobs: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  atualizarJob: async (id, job) => {
    try {
      const { Descricao, Status, FK_Campanha } = job;
      await api.put(`/jobs/${id}`, { Descricao, Status, FK_Campanha });
      const { data } = await api.get('/jobs');
      set({ jobs: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  deletarJob: async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      const { data } = await api.get('/jobs');
      set({ jobs: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  }
}));

// ─── PAGAMENTOS ──────────────────────────────────────────────────────────────
export const usePagamentosStore = create((set, get) => ({
  pagamentos: [],
  stats: null,
  loading: false,

  fetchPagamentos: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/pagamentos');
      set({ pagamentos: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/pagamentos/stats/resumo');
      set({ stats: data });
    } catch (error) {
      console.error(error);
    }
  },

  adicionarPagamento: async (pagamento) => {
    try {
      await api.post('/pagamentos', pagamento);
      const { data } = await api.get('/pagamentos');
      set({ pagamentos: data });
      // FIX: atualiza stats automaticamente após adicionar
      get().fetchStats();
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  atualizarPagamento: async (id, pagamento) => {
    try {
      await api.put(`/pagamentos/${id}`, pagamento);
      const { data } = await api.get('/pagamentos');
      set({ pagamentos: data });
      get().fetchStats();
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  deletarPagamento: async (id) => {
    try {
      await api.delete(`/pagamentos/${id}`);
      const { data } = await api.get('/pagamentos');
      set({ pagamentos: data });
      // FIX: atualiza stats automaticamente após deletar
      get().fetchStats();
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  }
}));
