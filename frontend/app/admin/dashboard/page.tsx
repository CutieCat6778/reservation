"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardStatsGrid from "@/components/DashboardStatsGrid";
import HourlyTable from "@/components/HourlyTable";

export default function AdminDashboard() {
  const { info, loading, error, refetch } = useDashboardData();

  if (loading || !info) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Fehler: {error.message}</p>
        <button className="btn btn-primary" onClick={() => refetch()}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <main className="p-6 min-h-screen bg-base-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <span className="text-sm opacity-70">
          {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </span>
      </div>

      <DashboardStatsGrid info={info} />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Stündliche Übersicht</h2>
        <HourlyTable hours={info.byHours} />
      </section>
    </main>
  );
}
