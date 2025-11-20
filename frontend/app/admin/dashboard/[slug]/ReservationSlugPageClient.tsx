"use client";

import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Reservation } from "@/lib/modelTypes";

const GET_BIG_RESERVATION = gql`
  query GetBigReservation {
    getBigReservation {
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
`;

const SEND_MESSAGE_TO_RESERVATION = gql`
  mutation SendMessageToReservation($id: ID!, $content: String!) {
    sendMessageToReservation(id: $id, content: $content)
  }
`;

const GET_ALL_RESERVATION = gql`
  query GetAllReservation {
    getReservationToday {
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
`;

const GET_ALL_RESERVATION_WITH_FILTER = gql`
  query GetAllReservationWithFilter($filter: ReservationFilter!) {
    getAllReservationWithFilter(filter: $filter) {
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
`;

const CONFIRM_RESERVATION = gql`
  mutation ConfirmReservation($id: ID!) {
    confirmReservation(id: $id) {
      id
      status
    }
  }
`;

const DECLINE_RESERVATION = gql`
  mutation DeclineReservation($id: ID!) {
    declineReservation(id: $id) {
      id
      status
    }
  }
`;

const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($input: UpdateReservation!) {
    updateReservation(input: $input) {
      id
      status
    }
  }
`;

const SLUG_CONFIG = {
  "big-tables": { title: "Große Tische", query: GET_BIG_RESERVATION, dataKey: "getBigReservation", useFilter: false },
  "total": { title: "Alle Reservierungen", query: GET_ALL_RESERVATION, dataKey: "getAllReservation", useFilter: false },
  "open": { title: "Offene Reservierungen", query: GET_ALL_RESERVATION_WITH_FILTER, dataKey: "getAllReservationWithFilter", useFilter: true, status: "OPEN" },
  "confirmed": { title: "Bestätigte Reservierungen", query: GET_ALL_RESERVATION_WITH_FILTER, dataKey: "getAllReservationWithFilter", useFilter: true, status: "CONFIRMED" },
  "canceled": { title: "Stornierte Reservierungen", query: GET_ALL_RESERVATION_WITH_FILTER, dataKey: "getAllReservationWithFilter", useFilter: true, status: "CANCELED" }
};

type ReservationQueryData =
  | { getBigReservation: Reservation[] }
  | { getAllReservation: Reservation[] }
  | { getAllReservationWithFilter: Reservation[] };

type Props = { slug: string };

export default function ReservationSlugPage({ slug }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const config = SLUG_CONFIG[slug as keyof typeof SLUG_CONFIG];
  const [fetchReservations, { data, loading, error, refetch }] = useLazyQuery<ReservationQueryData, any>(
    config?.query || GET_ALL_RESERVATION,
    { fetchPolicy: "network-only" }
  );

  const [confirmReservation] = useMutation(CONFIRM_RESERVATION);
  const [declineReservation] = useMutation(DECLINE_RESERVATION);
  const [updateReservation] = useMutation(UPDATE_RESERVATION);
  const [sendMessageToReservation] = useMutation(SEND_MESSAGE_TO_RESERVATION);

  useEffect(() => {
    const tokenStr = localStorage.getItem("adminToken");
    if (tokenStr) {
      try { const { token } = JSON.parse(tokenStr) as { token: string; expire: number }; setToken(token); } catch {}
    }
  }, []);

  useEffect(() => {
    if (token && config) {
      const variables = config.useFilter && "status" in config ? { filter: { status: config.status } } : undefined;
      fetchReservations({ variables, context: { headers: { Authorization: "Bearer " + token } } });
    }
  }, [token, config, fetchReservations]);

  const showNotification = (message: string) => { setNotification(message); setTimeout(() => setNotification(null), 3000); };

  const handleConfirm = async (id: string) => {
    try { await confirmReservation({ variables: { id }, context: { headers: { Authorization: "Bearer " + token } } }); showNotification("Reservierung bestätigt"); refetch(); }
    catch { showNotification("Fehler beim Bestätigen"); }
  };

  const handleDecline = (reservation: Reservation) => { setSelectedReservation(reservation); setShowModal(true); setSelectedTemplate(null); };

  const handleOpen = async (id: string) => {
    try { await updateReservation({ variables: { input: { id } }, context: { headers: { Authorization: "Bearer " + token } } }); showNotification("Reservierung auf offen gesetzt"); refetch(); }
    catch { showNotification("Fehler beim Öffnen"); }
  };

  const confirmDecline = async (reservation: Reservation) => {
    if (!selectedReservation || !selectedTemplate) return;
    const templates = emailTemplates(selectedReservation) as any;
    let content: any = templates[selectedTemplate].body;
    content += `<a
          href="${process.env.NEXT_PUBLIC_FRONTEND_URI}/reservation?id=${reservation.id}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Link zur Reservierung
        </a>
        <br/>
        <div class="footer">
          Ihr Yoake Restaurant-Team
        </div>
        `
    try {
      await declineReservation({
        variables: { id: selectedReservation.id },
        context: { headers: { Authorization: "Bearer " + token } }
      });
      await sendMessageToReservation({
        variables: { id: selectedReservation.id, content },
        context: { headers: { Authorization: "Bearer " + token } }
      });
      showNotification("Reservierung abgelehnt und Nachricht gesendet");
      setShowModal(false);
      setSelectedReservation(null);
      refetch();
    } catch {
      showNotification("Fehler beim Ablehnen oder Nachricht senden");
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const reservations: Reservation[] = data?.[config.dataKey as keyof typeof data] || [];

  const emailTemplates = (reservation: Reservation) => ({
    template1: {
      title: "Vor 18 Uhr und nach 20 Uhr",
      body: `<h2>Vor 18 Uhr und nach 20 Uhr</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>leider können wir Ihre Reservierung nur vor 18 Uhr oder nach 20 Uhr anbieten.</p>
<p>Mit freundlichen Grüßen</p>`
    },
    template2: {
      title: "Montag geschlossen",
      body: `<h2>Montag geschlossen</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>wir müssen Ihnen leider mitteilen, dass unser Restaurant montags geschlossen ist und wir Ihre Reservierung daher nicht annehmen können.</p>
<p>Mit freundlichen Grüßen</p>`
    },
    template3: {
      title: "Ab 20 Uhr",
      body: `<h2>Ab 20 Uhr</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>wir können Ihre Reservierung leider erst ab 20 Uhr anbieten.</p>
<p>Mit freundlichen Grüßen</p>`
    },
    template4: {
      title: "Ab 19 Uhr",
      body: `<h2>Ab 19 Uhr</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>wir können Ihre Reservierung leider erst ab 19 Uhr anbieten.</p>
<p>Mit freundlichen Grüßen</p>`
    },
    template5: {
      title: "Ab 18 Uhr",
      body: `<h2>Ab 18 Uhr</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>wir können Ihre Reservierung leider erst ab 18 Uhr anbieten.</p>
<p>Mit freundlichen Grüßen</p>`
    },
    template6: {
      title: "Ab 17 Uhr",
      body: `<h2>Ab 17 Uhr</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>wir können Ihre Reservierung leider erst ab 17 Uhr anbieten.</p>
<p>Mit freundlichen Grüßen</p>`
    },
    template7: {
      title: "Nicht geöffnet",
      body: `<h2>Nicht geöffnet</h2>
<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>leider können wir Ihre Reservierung nicht annehmen, da unser Restaurant zu diesem Zeitpunkt nicht geöffnet ist.</p>
<p>Mit freundlichen Grüßen</p>`
    }
  });

  return (
    <main className="p-4 min-h-screen bg-base-100 w-full">
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="alert alert-success shadow-lg">{notification}</div>
        </div>
      )}

      <div className="flex w-full justify-between">
        <h1 className="text-2xl font-bold mb-6">{config.title}</h1>
        <a href="/admin/dashboard" className="text-2xl font-bold mb-6">Zurück</a>
      </div>

      <div className="space-y-2">
        {reservations.map((reservation) => (
          <div key={reservation.id} className={"card shadow" + (reservation.amount >= 5 ? " bg-amber-200" : " bg-base-200")}>
            <div className="card-body">
              <div className="cursor-pointer" onClick={() => setExpandedId(expandedId === reservation.id ? null : reservation.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="card-title">{reservation.firstName} {reservation.lastName}</h2>
                    <p className="text-sm">{reservation.amount} Personen - {formatDate(reservation.reserveAt)}</p>
                    <p className="text-sm font-semibold">Status: <span className={`badge ${
reservation.status === "CONFIRMED" ? "badge-success" :
reservation.status === "CANCELED" || reservation.status === "DECLINED" ? "badge-error" :
reservation.status === "OPEN" ? "badge-warning" : "badge-ghost"
}`}>{reservation.status}</span></p>
                  </div>
                  <svg className={`w-6 h-6 transition-transform ${expandedId === reservation.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedId === reservation.id && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  <p className="text-sm font-semibold">Telefonnummer:</p>
                  <p className="text-sm">{reservation.phoneNumber || "Keine Telefonnummer"}</p>
                  <p className="text-sm font-semibold">E-Mail:</p>
                  <p className="text-sm">{reservation.email || "Keine E-Mails"}</p>
                  <p className="text-sm font-semibold">Notizen:</p>
                  <p className="text-sm">{reservation.notes || "Keine Notizen"}</p>
                  <p className="text-sm font-semibold">Erstellt am:</p>
                  <p className="text-sm">{formatDate(reservation.createdAt)}</p>
                  <div className="flex gap-2">
                    <button className="btn btn-warning btn-sm" onClick={() => handleOpen(reservation.id)} disabled={reservation.status === "OPEN"}>Offen</button>
                    <button className="btn btn-success btn-sm" onClick={() => handleConfirm(reservation.id)} disabled={reservation.status === "CONFIRMED"}>Bestätigen</button>
                    <button className="btn btn-error btn-sm" onClick={() => handleDecline(reservation)} disabled={reservation.status === "CANCELED" || reservation.status === "DECLINED"}>Ablehnen</button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newTime = prompt("Neue Uhrzeit (HH:MM):", "");
                        if (!newTime) return;

                        const [hh, mm] = newTime.split(":");
                        if (!hh || !mm) return;

                        const date = new Date(reservation.reserveAt);
                        date.setHours(Number(hh), Number(mm), 0, 0);

                        updateReservation({
                          variables: { input: { id: reservation.id, reserveAt: date.toISOString() } },
                          context: { headers: { Authorization: "Bearer " + token } }
                        })
                          .then(() => {
                            showNotification("Uhrzeit aktualisiert");
                            refetch();
                          })
                          .catch(() => showNotification("Fehler beim Aktualisieren"));
                      }}
                    >
                      Zeit ändern
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedReservation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Reservierung ablehnen</h3>
            <div className="space-y-2">
              {Object.entries(emailTemplates(selectedReservation)).map(([key, template]) => (
                <label key={key} className="collapse collapse-arrow bg-base-200">
                  <input type="radio" name="emailTemplate" checked={selectedTemplate === key} onChange={() => setSelectedTemplate(key)} />
                  <div className="collapse-title font-medium">{template.title}</div>
                  <div className="collapse-content">
                    <pre className="whitespace-pre-wrap">{template.body}</pre>
                  </div>
                </label>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>Abbrechen</button>
              <button className="btn btn-error" onClick={() => confirmDecline(selectedReservation)} disabled={!selectedTemplate}>Ablehnen bestätigen</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

