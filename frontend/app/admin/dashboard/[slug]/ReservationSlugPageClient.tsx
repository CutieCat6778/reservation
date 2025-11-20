"use client";

import { useState } from "react";
import { useReservations } from "@/hooks/useReservations";
import ReservationCard from "@/components/ReservationCard";
import DeclineModal from "@/components/DeclineModal";
import NotificationToast from "@/components/NotificationToast";
import { emailTemplates } from "@/lib/emailTemplates";
import { Reservation } from "@/lib/modelTypes"

const TITLES: Record<string, string> = {
  "big-tables": "Große Tische",
  total: "Alle Reservierungen",
  open: "Offene Reservierungen",
  confirmed: "Bestätigte Reservierungen",
  canceled: "Stornierte Reservierungen",
};

export default function ReservationSlugPage({ slug }: { slug: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const { reservations, loading, refetch, confirm, decline, update, sendMessage } = useReservations(slug);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
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

  if (loading) return <div>Lädt...</div>;

  return (
    <main className="p-4 min-h-screen bg-base-100">
      <NotificationToast message={notification} onClose={() => setNotification(null)} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{TITLES[slug] || "Reservierungen"}</h1>
        <a href="/admin/dashboard" className="link">← Zurück</a>
      </div>

      <div className="space-y-4">
        {reservations.map((r) => (
          <ReservationCard
            key={r.id}
            reservation={r}
            expanded={expandedId === r.id}
            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
            onConfirm={() => confirm(r.id).then(() => { showNotification("Bestätigt"); refetch(); })}
            onDecline={() => { setSelectedReservation(r); setSelectedTemplate(null); setShowModal(true); }}
            onOpen={() => update({ id: r.id, status: "OPEN" }).then(() => { showNotification("Auf offen gesetzt"); refetch(); })}
            onChangeTime={() => handleChangeTime(r)}
          />
        ))}
      </div>

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
