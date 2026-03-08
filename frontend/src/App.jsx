import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalhes from './pages/ClienteDetalhes';
import Campanhas from './pages/Campanhas';
import CampanhaDetalhes from './pages/CampanhaDetalhes';
import Jobs from './pages/Jobs';
import JobDetalhes from './pages/JobDetalhes';
import Pagamentos from './pages/Pagamentos';
import PagamentoDetalhes from './pages/PagamentoDetalhes';
import Tarefas from './pages/Tarefas';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Layout>{children}</Layout> : <Navigate replace to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
        <Route path="/clientes/:id" element={<PrivateRoute><ClienteDetalhes /></PrivateRoute>} />
        <Route path="/campanhas" element={<PrivateRoute><Campanhas /></PrivateRoute>} />
        <Route path="/campanhas/:id" element={<PrivateRoute><CampanhaDetalhes /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
        <Route path="/jobs/:id" element={<PrivateRoute><JobDetalhes /></PrivateRoute>} />
        <Route path="/pagamentos" element={<PrivateRoute><Pagamentos /></PrivateRoute>} />
        <Route path="/pagamentos/:id" element={<PrivateRoute><PagamentoDetalhes /></PrivateRoute>} />
        <Route path="/tarefas" element={<PrivateRoute><Tarefas /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
