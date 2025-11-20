"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Reservation, LoginWithReservationResponse, ReservationStatus } from "@/lib/modelTypes";
import { useSearchParams } from "next/navigation";

const LOGIN_WITH_RESERVATION = gql`
  mutation LoginWithReservation($id: ID!, $lastName: String!) {
    loginWithReservation(id: $id, lastName: $lastName) {
      token
      reservation {
        id
        firstName
        lastName
        phoneNumber
        email
        amount
        createdAt
        reserveAt
        status
        notes
      }
    }
  }
`;

const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($input: UpdateReservation!) {
    updateReservation(input: $input) {
      id
      firstName
      lastName
      amount
      reserveAt
      status
      notes
    }
  }
`;

const CANCEL_RESERVATION = gql`
  mutation CancelReservation($id: ID!) {
    cancelReservation(id: $id) {
      id
      status
    }
  }
`;

export default function UserDashboard() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lastNameInput, setLastNameInput] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Track which field is in edit mode
  const [editFields, setEditFields] = useState<{ [key in keyof Reservation]?: boolean }>({});

  const [loginWithReservation, { loading: loginLoading }] = useMutation<{loginWithReservation: LoginWithReservationResponse}>(LOGIN_WITH_RESERVATION);
  const [updateReservation] = useMutation<{updateReservation: Reservation}>(UPDATE_RESERVATION);
  const [cancelReservation] = useMutation<{cancelReservation: Reservation}>(CANCEL_RESERVATION);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async () => {
    if (!reservationId || !lastNameInput) return;
    try {
      const result = await loginWithReservation({ variables: { id: reservationId, lastName: lastNameInput } });
      const loginData = result.data?.loginWithReservation;
      if (!loginData || !loginData.reservation) {
        showNotification("Falscher Nachname oder Reservierung nicht gefunden");
        return;
      }
      const { token, reservation } = loginData;
      localStorage.setItem("userToken", JSON.stringify({ token, expire: Date.now() + 24*60*60*1000 }));
      setToken(token);
      setReservation(reservation);
      setShowAuthModal(false);
      showNotification("Erfolgreich angemeldet!");
    } catch {
      showNotification("Falscher Nachname oder Reservierung nicht gefunden");
    }
  };

  const handleCancel = async () => {
    if (!reservation || !token) return;
    try {
      await cancelReservation({ variables: { id: reservation.id }, context: { headers: { Authorization: "Bearer " + token } } });
      setReservation({ ...reservation, status: ReservationStatus.CANCELED });
      showNotification("Reservierung storniert");
    } catch {
      showNotification("Fehler beim Stornieren");
    }
  };

  const handleUpdateField = async (field: keyof Reservation, value: any) => {
    if (!reservation || !token) return;
    try {
      const { data } = await updateReservation({
        variables: { input: { id: reservation.id, [field]: value } },
        context: { headers: { Authorization: "Bearer " + token } }
      });
      const result = data?.updateReservation;
      if (!data || !result) {
        showNotification("Falscher Nachname oder Reservierung nicht gefunden");
        return;
      }
      setReservation(data.updateReservation);
      setEditFields({ ...editFields, [field]: false });
      showNotification("Feld aktualisiert");
    } catch {
      showNotification("Fehler beim Aktualisieren");
    }
  };

  if (!reservationId) {
    return <div className="flex items-center justify-center min-h-screen"><p>Reservierungs-ID fehlt</p></div>;
  }

  if (showAuthModal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="card p-6 shadow w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Reservierung anmelden</h2>
          <p className="mb-2">Nachname der Reservierung:</p>
          <input type="text" className="input input-bordered w-full mb-4" value={lastNameInput} onChange={e => setLastNameInput(e.target.value)} />
          <button className={`btn btn-primary w-full ${loginLoading ? "loading" : ""}`} onClick={handleLogin} disabled={loginLoading}>Anmelden</button>
        </div>
        {notification && <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"><div className="alert alert-error shadow-lg"><span>{notification}</span></div></div>}
      </div>
    );
  }

  if (!reservation) return <div className="flex items-center justify-center min-h-screen"><p>Lade Ihre Reservierung…</p></div>;

  const renderField = (label: string, field: keyof Reservation, type: string = "text") => {
    const value = reservation[field];

    // Format reserveAt for display
    const displayValue = field === "reserveAt" && value
      ? new Date(value as string).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })
      : value;

    return (
      <p className="flex items-center gap-2">
        <strong>{label}:</strong>
        {editFields[field] ? (
          <>
            <input
              type={type === "datetime-local" ? "datetime-local" : type}
              className="input input-bordered"
              value={
                field === "reserveAt" && value
                  ? new Date(value as string).toISOString().slice(0, 16)
                  : (reservation[field] as any) || ""
              }
              onChange={e => setReservation({ ...reservation, [field]: e.target.value })}
            />
            <button className="btn btn-sm btn-success" onClick={() => handleUpdateField(field, reservation[field])}>Speichern</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setEditFields({ ...editFields, [field]: false })}>Abbrechen</button>
          </>
        ) : (
            <>
              <span>{displayValue}</span>
              <button className="btn btn-sm btn-outline ml-2" onClick={() => setEditFields({ ...editFields, [field]: true })}>Bearbeiten</button>
            </>
          )}
      </p>
    );
  };

  return (
    <main className="p-4 min-h-screen bg-base-100">
      {notification && <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"><div className="alert alert-success shadow-lg"><span>{notification}</span></div></div>}
      <h1 className="text-2xl font-bold mb-6">Meine Reservierung</h1>
      <div className="card bg-base-200 p-4 shadow">
        <div className="card-body space-y-4">
          {renderField("Vorname", "firstName")}
          {renderField("Nachname", "lastName")}
          {renderField("Telefon", "phoneNumber")}
          {renderField("Email", "email")}
          {renderField("Anzahl Personen", "amount", "number")}
          {renderField("Reservierungsdatum", "reserveAt", "datetime-local")}
          <p>
            <strong>Status:</strong>{" "}
            <span className={`badge ${reservation.status === "CONFIRMED" ? "badge-success" : reservation.status === "CANCELED" ? "badge-error" : "badge-warning"}`}>
              {reservation.status === "CONFIRMED" ? "Bestätigt" : reservation.status === "CANCELED" ? "Storniert" : "Offen"}
            </span>
          </p>
          {renderField("Notizen", "notes")}

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button className="btn btn-warning" onClick={handleCancel} disabled={reservation.status === "CANCELED"}>Reservierung stornieren</button>
            <a href="mailto:info@yoake-tuttlingen.de" className="btn btn-secondary">Nachricht senden</a>
          </div>
        </div>
      </div>
    </main>
  );
}

