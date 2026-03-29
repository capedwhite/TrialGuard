import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import PublicRoute from './routes/publicRoute';
import Login from './pages/login';
import Register from './pages/register';
import PrivateRoute from './routes/privateRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes — redirect to dashboard if already logged in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Private routes — redirect to login if not authenticated */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    </Routes>
  );
}