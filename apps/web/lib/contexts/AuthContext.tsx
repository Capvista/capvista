"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  role: "INVESTOR" | "FOUNDER" | "ADMIN";
  firstName: string;
  lastName: string;
};

type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "INVESTOR" | "FOUNDER";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount, check localStorage for existing session
  useEffect(() => {
    const storedToken = localStorage.getItem("capvista_token");
    const storedUser = localStorage.getItem("capvista_user");

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return {
          error: { message: result.error?.message || "Registration failed" },
        };
      }

      // Save token and user
      localStorage.setItem("capvista_token", result.data.accessToken);
      localStorage.setItem("capvista_user", JSON.stringify(result.data.user));
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      return { error: null };
    } catch (err) {
      return { error: { message: "Network error. Is the API running?" } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        return { error: { message: result.error?.message || "Login failed" } };
      }

      // Save token and user
      localStorage.setItem("capvista_token", result.data.accessToken);
      localStorage.setItem("capvista_user", JSON.stringify(result.data.user));
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      return { error: null };
    } catch (err) {
      return { error: { message: "Network error. Is the API running?" } };
    }
  };

  const signOut = () => {
    localStorage.removeItem("capvista_token");
    localStorage.removeItem("capvista_user");
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, accessToken, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
