import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Layout from './components/Layout';

// Login fica em src/ direto
import Login from './Login';

// Pages — ficam em src/pages/
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalhes from './pages/ClienteDetalhes';
import Campanhas from './pages/Campanhas';
import CampanhaDetalhes from './pages/CampanhaDetalhes';
import Tarefas from './pages/Tarefas';
import Jobs from './pages/Jobs';
import JobDetalhes from './pages/JobDetalhes';
import Pagamentos from './pages/Pagamentos';
import PagamentoDetalhes from './pages/PagamentoDetalhes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
        }/>

        <Route path="/clientes" element={
          <ProtectedRoute><Layout><Clientes /></Layout></ProtectedRoute>
        }/>
        <Route path="/clientes/:id" element={
          <ProtectedRoute><Layout><ClienteDetalhes /></Layout></ProtectedRoute>
        }/>

        <Route path="/campanhas" element={
          <ProtectedRoute><Layout><Campanhas /></Layout></ProtectedRoute>
        }/>
        <Route path="/campanhas/:id" element={
          <ProtectedRoute><Layout><CampanhaDetalhes /></Layout></ProtectedRoute>
        }/>

        <Route path="/jobs" element={
          <ProtectedRoute><Layout><Jobs /></Layout></ProtectedRoute>
        }/>
        <Route path="/jobs/:id" element={
          <ProtectedRoute><Layout><JobDetalhes /></Layout></ProtectedRoute>
        }/>

        <Route path="/pagamentos" element={
          <ProtectedRoute><Layout><Pagamentos /></Layout></ProtectedRoute>
        }/>
        <Route path="/pagamentos/:id" element={
          <ProtectedRoute><Layout><PagamentoDetalhes /></Layout></ProtectedRoute>
        }/>

        <Route path="/tarefas" element={
          <ProtectedRoute><Layout><Tarefas /></Layout></ProtectedRoute>
        }/>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
