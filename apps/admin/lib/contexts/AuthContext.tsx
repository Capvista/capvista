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
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://capvista-api.onrender.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const clearAuth = () => {
    localStorage.removeItem("capvista_admin_token");
    localStorage.removeItem("capvista_admin_user");
    document.cookie = "capvista_admin_token=; path=/; max-age=0";
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("capvista_admin_token");
    const storedUser = localStorage.getItem("capvista_admin_user");

    if (storedToken && storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "ADMIN") {
        clearAuth();
        setLoading(false);
        return;
      }

      // Validate token is still valid by calling the API
      fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (res.ok) {
            setAccessToken(storedToken);
            setUser(parsed);
            document.cookie = `capvista_admin_token=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          } else {
            // Token is expired or invalid — clear and redirect to login
            clearAuth();
          }
        })
        .catch(() => {
          // Network error — still allow offline access with stored data
          setAccessToken(storedToken);
          setUser(parsed);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const publicPaths = ["/login", "/signup", "/setup-mfa", "/verify-mfa"];
    if (!loading && !user && !publicPaths.includes(pathname)) {
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
      document.cookie = `capvista_admin_token=${result.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      return { error: null };
    } catch (err) {
      return { error: { message: "Network error. Is the API running?" } };
    }
  };

  const signOut = () => {
    clearAuth();
    router.push("/login");
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      signOut();
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signOut, authFetch }}>
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
