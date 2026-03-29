import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const SUBSCRIPTIONS_KEY = ["subscriptions"];

// ── Get all subscriptions ─────────────────────────────────────────
export const useSubscriptions = (page = 1, limit = 20) => {
  console.log("Fetching subscriptions for page:", page, "with limit:", limit);
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, page],
    queryFn: () =>
      api
        .get(`/api/subscriptions?page=${page}&limit=${limit}`)
        .then((res) => res.data),
  });
};

// ── Create subscription ───────────────────────────────────────────
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/api/subscriptions", data),
    onSuccess: () => {
      // Invalidate cache — forces fresh fetch after mutation
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      // Also invalidate notifications since new ones were created
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// ── Update subscription ───────────────────────────────────────────
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/api/subscriptions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      // Also invalidate notifications since they may have changed
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// ── Delete subscription ───────────────────────────────────────────
export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/api/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      // Invalidate notifications since they're tied to subscriptions
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
