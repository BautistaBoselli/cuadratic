import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";

const AuthContext = createContext<{
  username: string | null;
  isLogged: boolean;
  login: (username: string) => void;
  logout: () => void;
  status: "unauthenticated" | "pending" | "authenticated";
}>({
  username: null,
  isLogged: false,
  login: () => {},
  logout: () => {},
  status: "pending",
});

export function useSession() {
  return useContext(AuthContext);
}

export function Auth({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/whoami"],
    queryFn: async () => {
      const response = await fetch("/api/auth/whoami");
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      return response.json();
    },
  });
  console.log({ data });

  const status = isLoading
    ? "pending"
    : data
    ? "authenticated"
    : "unauthenticated";
  const isLogged = status === "authenticated";

  const login = (username: string) => {
    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    }).then((response) => {
      if (response.ok) {
        queryClient.invalidateQueries();
      } else {
        alert("Error logging in");
      }
    });
  };

  const logout = () => {
    queryClient.invalidateQueries();
  };

  return (
    <AuthContext.Provider
      value={{
        username: data?.username ?? null,
        isLogged,
        login,
        logout,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
