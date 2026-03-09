import { create } from 'zustand';
import api from './api';

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

  carregarUsuario: () => {
    const token = localStorage.getItem('token');
    if (token) set({ token });
  }
}));

export const useClientesStore = create((set) => ({
  clientes: [],
  statuses: [],
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

  fetchStatuses: async () => {
    try {
      const { data } = await api.get('/clientes/status/lista');
      set({ statuses: data });
    } catch (error) {
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
      await api.put(`/tarefas/${id}`, tarefa);
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
      await api.post('/jobs', job);
      const { data } = await api.get('/jobs');
      set({ jobs: data });
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  },

  atualizarJob: async (id, job) => {
    try {
      await api.put(`/jobs/${id}`, job);
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

export const useCampanhasStore = create((set) => ({
  campanhas: [],
  loading: false,

  fetchCampanhas: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/campanhas');
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

export const usePagamentosStore = create((set) => ({
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
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro };
    }
  }
}));

export const useAdminStore = create((set) => ({
  admins: [],
  loading: false,

  fetchAdmins: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/administradores');
      set({ admins: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },

  adicionarAdmin: async (admin) => {
    try {
      await api.post('/administradores', admin);
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro || 'Erro ao criar admin' };
    }
  },

  editarAdmin: async (id, admin) => {
    try {
      await api.put(`/administradores/${id}`, admin);
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro || 'Erro ao editar admin' };
    }
  },

  deletarAdmin: async (id) => {
    try {
      await api.delete(`/administradores/${id}`);
      return { sucesso: true };
    } catch (error) {
      return { sucesso: false, erro: error.response?.data?.erro || 'Erro ao deletar admin' };
    }
  }
}));
