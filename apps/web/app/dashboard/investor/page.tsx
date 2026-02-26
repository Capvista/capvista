import { Suspense } from "react";
import InvestorDashboardContent from "./InvestorDashboardContent";

export default function InvestorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#F6F8FA" }}
        >
          <div className="w-12 h-12 border-4 border-[#0A1F44] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <InvestorDashboardContent />
    </Suspense>
  );
}
