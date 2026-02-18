"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        const role = (user as any).user_metadata?.role || user.role;
        if (role === "INVESTOR") {
          router.push("/dashboard/investor");
        } else if (role === "FOUNDER") {
          router.push("/dashboard/founder");
        } else {
          router.push("/dashboard/investor"); // Default fallback
        }
      }
    }
  }, [user, loading, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F6F8FA" }}
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate">Redirecting...</p>
      </div>
    </div>
  );
}
