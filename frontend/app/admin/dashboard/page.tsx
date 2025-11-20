"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client/react";
import { GET_RESERVATION_INFO_TODAY } from "@/graphql/queries";
import { ReservationInfo } from "@/lib/modelTypes";

export default function AdminDashboard() {
  const [now, setNow] = useState(new Date());
  const [token, setToken] = useState<string | null>(null);

  const [fetchReservationInfo, { data, loading, error, refetch }] = useLazyQuery<{
    getReservationInfoToday: ReservationInfo;
  }>(GET_RESERVATION_INFO_TODAY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    const tokenStr = localStorage.getItem("adminToken");
    if (tokenStr) {
      try {
        const { token } = JSON.parse(tokenStr) as { token: string; expire: number };
        setToken(token);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchReservationInfo({
        context: {
          headers: {
            Authorization: "Bearer " + token
          } }
      });
    }
  }, [token, fetchReservationInfo]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data?.getReservationInfoToday) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Bitte warten Sie</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">
          Fehler beim Laden der Daten: {error.message}
        </p>
        <button className="btn btn-neutral mt-4" onClick={() => refetch()}>
          Neu laden
        </button>
      </div>
    );
  }

  const reservationData = data.getReservationInfoToday;
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <main className="p-4 min-h-screen bg-base-100">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/dashboard/open"
          className={`card p-4 shadow hover:shadow-lg transition ${
            reservationData.totalOpenReservation === 0
            ? "bg-green-200"
            : reservationData.totalOpenReservation <= 10
            ? "bg-yellow-200"
            : "bg-red-200"
            }`}
        >
          <h2 className="text-lg font-semibold">Offene Reservierungen</h2>
          <p className="text-3xl font-bold">{reservationData.totalOpenReservation}</p>
        </Link>

        <Link
          href="/admin/dashboard/confirmed"
          className={`card p-4 shadow hover:shadow-lg transition ${
            reservationData.totalConfirmedReservation === 0
            ? "bg-green-200"
            : reservationData.totalConfirmedReservation <= 360
            ? "bg-yellow-200"
            : "bg-red-200"
            }`}
        >
          <h2 className="text-lg font-semibold">Bestätigte Reservierungen</h2>
          <p className="text-3xl font-bold">{reservationData.totalConfirmedReservation}</p>
        </Link>

        <Link
          href="/admin/dashboard/canceled"
          className={`card p-4 shadow hover:shadow-lg transition ${
            reservationData.totalCanceledReservation === 0
            ? "bg-green-200"
            : reservationData.totalCanceledReservation <= 5
            ? "bg-yellow-200"
            : "bg-red-200"
            }`}
        >
          <h2 className="text-lg font-semibold">Stornierte Reservierungen</h2>
          <p className="text-3xl font-bold">{reservationData.totalCanceledReservation}</p>
        </Link>
        <Link href="/admin/dashboard/total" className="card bg-base-200 p-4 shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Gesamtreservierungen</h2>
          <p className="text-3xl font-bold">{reservationData.totalReservation}</p>
        </Link>
        <Link href="/admin/dashboard" className="card bg-base-200 p-4 shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Gesamtpersonen</h2>
          <p className="text-3xl font-bold">{reservationData.totalPerson}</p>
        </Link>
        <Link href="/admin/dashboard/big-tables" className="card bg-base-200 p-4 shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Gesamter großen Tische</h2>
          <p className="text-3xl font-bold">{reservationData.totalBigReservation}</p>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Stündliche Reservierungen</h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Start</th>
              <th>Gesamtreservierungen</th>
              <th>Gesamter großen Tische</th>
              <th>Gesamtpersonen</th>
            </tr>
          </thead>
          <tbody>
            {reservationData.byHours.map((hour, idx) => {
              const isCurrent =
                now >= new Date(hour.startsAt) && now < new Date(hour.endsAt);
              return (
                <tr key={idx} className={isCurrent ? "bg-yellow-100" : ""}>
                  <td>{formatTime(hour.startsAt)}</td>
                  <td>{hour.totalReservation}</td>
                  <td>{hour.totalBigReservation}</td>
                  <td>{hour.totalPerson}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
