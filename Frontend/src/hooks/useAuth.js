import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


// ── Register ──────────────────────────────────────────────────────
export const useRegister = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => api.post('/api/auth/register', data),
    onSuccess: (res) => {
      login(res.data.user);
      navigate('/dashboard');
    },
  });
};

// ── Login ─────────────────────────────────────────────────────────
export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => api.post('/api/auth/login', data),
    onSuccess: (res) => {
      login(res.data.user);
      navigate('/dashboard');
    },
  });
};

// ── Logout ────────────────────────────────────────────────────────
export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });
};