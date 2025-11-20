"use client";

import { useGuestReservation } from "@/hooks/useGuestReservation";
import GuestAuthModal from "@/components/GuestAuthModal";
import EditableField from "@/components/EditableField";
import ReservationStatusBadge from "@/components/ReservationStatusBadge";
import NotificationToast from "@/components/NotificationToast";

export default function GuestReservationPage() {
  const {
    reservationId,
    reservation,
    showAuthModal,
    lastNameInput,
    setLastNameInput,
    notification,
    handleLogin,
    handleUpdate,
    handleCancel,
    setShowAuthModal,
  } = useGuestReservation();

  if (!reservationId) {
    return <div className="flex items-center justify-center min-h-screen">Ungültiger Link</div>;
  }

  if (showAuthModal) {
    return (
      <>
        <GuestAuthModal
          lastName={lastNameInput}
          onChange={(e) => setLastNameInput(e.target.value)}
          onSubmit={handleLogin}
          loading={false}
        />
        <NotificationToast message={notification} onClose={() => {}} />
      </>
    );
  }

  if (!reservation) {
    return <div className="flex items-center justify-center min-h-screen">Lade Reservierung…</div>;
  }

  return (
    <main className="p-6 min-h-screen bg-base-100">
      <NotificationToast message={notification} onClose={() => {}} />

      <h1 className="text-3xl font-bold mb-8 text-center">Meine Reservierung</h1>

      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body space-y-6">
            <div className="text-center">
              <ReservationStatusBadge status={reservation.status} />
            </div>

            <EditableField label="Vorname" value={reservation.firstName} field="firstName" onSave={handleUpdate} />
            <EditableField label="Nachname" value={reservation.lastName} field="lastName" onSave={handleUpdate} />
            <EditableField label="Telefon" value={reservation.phoneNumber} field="phoneNumber" onSave={handleUpdate} />
            <EditableField label="E-Mail" value={reservation.email} field="email" onSave={handleUpdate} />
            <EditableField label="Personen" value={reservation.amount} field="amount" type="number" onSave={handleUpdate} />
            <EditableField label="Datum & Uhrzeit" value={reservation.reserveAt} field="reserveAt" type="datetime-local" onSave={handleUpdate} />
            <EditableField label="Notizen" value={reservation.notes} field="notes" onSave={handleUpdate} />

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                className="btn btn-error flex-1"
                onClick={handleCancel}
                disabled={reservation.status === "CANCELED"}
              >
                Reservierung stornieren
              </button>
              <a href="mailto:info@yoake-tuttlingen.de" className="btn btn-outline flex-1">
                Nachricht ans Restaurant
              </a>
            </div>

            <div className="text-center text-sm opacity-70 mt-6">
              <button className="link" onClick={() => { localStorage.removeItem("userToken"); setShowAuthModal(true); }}>
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
