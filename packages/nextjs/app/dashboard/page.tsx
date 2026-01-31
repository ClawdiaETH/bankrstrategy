"use client";

import dynamic from "next/dynamic";

// Disable SSR for the dashboard (uses wagmi hooks that need localStorage)
const DashboardContent = dynamic(() => import("./DashboardContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  ),
});

export default function Dashboard() {
  return <DashboardContent />;
}
