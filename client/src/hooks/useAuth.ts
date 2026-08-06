import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export function useAuth() {
  const queryClient = useQueryClient();
  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  useEffect(() => {
    // Clean legacy localStorage token if present.
    localStorage.removeItem("freonn_platform_token");
  }, []);

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user: me.data ?? null,
    isLoading: me.isLoading,
    isAuthenticated: !!me.data,
    logout,
  };
}
