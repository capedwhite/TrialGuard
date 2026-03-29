import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications').then(res => res.data),
    enabled: !!user,
  });
};