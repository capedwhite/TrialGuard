import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// ── Response interceptor ──────────────────────────────────────────
// Runs on every response before it reaches your components.
// Note: 401 errors are handled by components (PrivateRoute, PublicRoute)
// not here, to avoid infinite redirect loops.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let components handle 401 errors based on auth state
    return Promise.reject(error);
  }
);

export default api;