"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardStatsGrid from "@/components/DashboardStatsGrid";
import HourlyTable from "@/components/HourlyTable";
import DeclineModal from "@/components/DeclineModal";
import NotificationToast from "@/components/NotificationToast";
import { emailTemplates } from "@/lib/emailTemplates";
import { Reservation } from "@/lib/modelTypes";
import { useReservations } from "@/hooks/useReservations";

export default function AdminDashboard() {
  const { info, loading, error, refetch } = useDashboardData();
  const { confirm, decline, update, openReservation, sendMessage } = useReservations("total");
  
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirm = async (id: string) => {
    await confirm(id);
    showNotification("Bestätigt");
    refetch();
  };

  const handleDecline = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setSelectedTemplate(null);
    setShowModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedReservation || !selectedTemplate) return;

    const templates = emailTemplates(selectedReservation);
    let content = templates[selectedTemplate as keyof typeof templates].body;
    content += `<br/><a href="${process.env.NEXT_PUBLIC_FRONTEND_URI}/reservation?id=${selectedReservation.id}">Link zur Reservierung</a><br/><div>Ihr Yoake Restaurant-Team</div>`;

    try {
      await decline(selectedReservation.id);
      await sendMessage(selectedReservation.id, content);
      showNotification("Reservierung abgelehnt und E-Mail gesendet");
      setShowModal(false);
      setSelectedReservation(null);
      refetch();
    } catch {
      showNotification("Fehler beim Ablehnen");
    }
  };

  const handleOpen = async (id: string) => {
    await openReservation(id);
    showNotification("Auf offen gesetzt");
    refetch();
  };

  const handleChangeTime = async (reservation: Reservation) => {
    const newTime = prompt("Neue Uhrzeit (HH:MM):", "");
    if (!newTime?.match(/^\d{2}:\d{2}$/)) return;

    const [h, m] = newTime.split(":");
    const date = new Date(reservation.reserveAt);
    date.setHours(+h, +m, 0, 0);

    try {
      await update({ id: reservation.id, reserveAt: date.toISOString() });
      showNotification("Uhrzeit geändert");
      refetch();
    } catch {
      showNotification("Fehler");
    }
  };

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
      <NotificationToast message={notification} onClose={() => setNotification(null)} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <span className="text-sm opacity-70">
          {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </span>
      </div>

      <DashboardStatsGrid info={info} />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Stündliche Übersicht</h2>
        <HourlyTable
          hours={info.byHours}
          onConfirm={handleConfirm}
          onDecline={handleDecline}
          onOpen={handleOpen}
          onChangeTime={handleChangeTime}
        />
      </section>

      {showModal && selectedReservation && (
        <DeclineModal
          reservation={selectedReservation}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          onConfirm={handleDeclineConfirm}
          onClose={() => { setShowModal(false); setSelectedReservation(null); }}
        />
      )}
    </main>
  );
}
