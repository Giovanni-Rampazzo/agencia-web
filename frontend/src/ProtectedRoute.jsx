import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './store';

export function ProtectedRoute({ children }) {
  const { token, carregarUsuario } = useAuthStore();

  useEffect(() => {
    carregarUsuario();
  }, []);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
