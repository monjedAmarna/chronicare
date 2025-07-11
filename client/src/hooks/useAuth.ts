import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut, getCurrentUser, UserProfile } from "@/api/auth.api";
import { useLocation } from "wouter";
import React from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const { data: user, isLoading, error, isError } = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
    retry: false,
  });

  // Handle error: if user not found or unauthorized, clear token and redirect
  React.useEffect(() => {
    if (isError && error) {
      // Axios error: error.response.status
      // Fetch error: error.message
      const status = (error as any)?.response?.status;
      const message = (error as any)?.message || "";
      if (
        status === 401 ||
        status === 404 ||
        message.toLowerCase().includes("user not found")
      ) {
        localStorage.removeItem("token");
        setLocation("/signin");
      }
    }
  }, [isError, error, setLocation]);

  const loginMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("token", data.token);
      // Update the user data in the cache
      queryClient.setQueryData(["auth-user"], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Remove token from localStorage
      localStorage.removeItem("token");
      // Clear the user data from cache
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
    },
  });

  const login = (data: { user: UserProfile; token: string }) => {
    localStorage.setItem("token", data.token);
    queryClient.setQueryData(["auth-user"], data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["auth-user"], null);
    queryClient.clear();
  };

  return {
    user,
    isLoading: isLoading && !isError,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    loginMutation,
    logoutMutation,
  };
}
