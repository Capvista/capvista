"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: string;
  email: string;
  role: "INVESTOR" | "FOUNDER" | "ADMIN";
  firstName: string;
  lastName: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
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
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem("capvista_admin_token");
    const storedUser = localStorage.getItem("capvista_admin_user");

    if (storedToken && storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === "ADMIN") {
        setAccessToken(storedToken);
        setUser(parsed);
      } else {
        localStorage.removeItem("capvista_admin_token");
        localStorage.removeItem("capvista_admin_user");
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

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

      if (result.data.user.role !== "ADMIN") {
        return { error: { message: "Access denied. Admin credentials required." } };
      }

      localStorage.setItem("capvista_admin_token", result.data.accessToken);
      localStorage.setItem("capvista_admin_user", JSON.stringify(result.data.user));
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      return { error: null };
    } catch (err) {
      return { error: { message: "Network error. Is the API running?" } };
    }
  };

  const signOut = () => {
    localStorage.removeItem("capvista_admin_token");
    localStorage.removeItem("capvista_admin_user");
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signOut }}>
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
