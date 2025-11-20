"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_RESERVATION } from "@/graphql/mutations"; // import your mutation
import { LoginWithReservationResponse } from "@/lib/modelTypes";

export default function ReservationForm() {
  const [phase, setPhase] = useState(1);
  const router = useRouter();
  const [reservationCreated, setReservationCreated] = useState<{
    id: string;
    token: string;
  } | null>(null);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [persons, setPersons] = useState(2);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");

  const [createReservation, { loading, error }] = useMutation<{ createReservation: LoginWithReservationResponse }>(
    CREATE_RESERVATION
  );

  const handleNext = async () => {
    if (phase === 1 && (!date || !time || persons < 1)) return;
    if (phase === 2 && (!email || !phone || phone.length < 10 || !lastName)) return;

    if (phase === 2) {
      const reserveAt = new Date(`${date}T${time}`);
      try {
        const { data } = await createReservation({
          variables: {
            firstName,
            lastName,
            phoneNumber: phone,
            email,
            amount: persons,
            reserveAt: reserveAt.toISOString(),
            notes: message || "",
          },
        });

        const reservationId = data?.createReservation?.reservation?.id;
        const token = data?.createReservation?.token;

        if (reservationId && token) {
          localStorage.setItem(
            "userToken",
            JSON.stringify({ token, expire: Date.now() + 24 * 60 * 60 * 1000 })
          );
          setReservationCreated({ id: reservationId, token });
          return;
        }
      } catch (e) {
        console.error("Error creating reservation:", e);
        return;
      }
    }

    setPhase(phase + 1);
  };

  const handlePrev = () => setPhase(phase - 1);

  const progressValue = phase === 1 ? 50 : 100;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-lg border p-4 mt-6 px-8">
      <legend className="fieldset-legend w-full">
        <progress className="progress w-full" value={progressValue} max="100"></progress>
      </legend>

      {phase === 1 && (
        <>
          <label className="label w-full">Datum</label>
          <input
            type="date"
            className="input w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={today}
          />
          <label className="label">Uhrzeit</label>
          <input
            type="time"
            className="input w-full"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <label className="label">Personenanzahl</label>
          <input
            type="number"
            className="input w-full"
            value={persons}
            onChange={(e) => setPersons(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            required
          />
          <div className="flex justify-end mt-4">
            <button className="btn btn-neutral w-1/2" onClick={handleNext}>
              Weiter
            </button>
          </div>
        </>
      )}

      {phase === 2 && (
        <>
          <label className="label">Email</label>
          <input
            type="email"
            className="input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="label">Telefonnummer</label>
          <input
            type="tel"
            className="input w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
            required
            minLength={10}
            maxLength={15}
          />
          <label className="label">Vorname</label>
          <input
            type="text"
            className="input w-full"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label className="label">Nachname</label>
          <input
            type="text"
            className="input w-full"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <label className="label">Nachricht an Team</label>
          <textarea
            className="textarea w-full rounded-xl"
            placeholder="Schreibe hier"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {error && <p className="text-red-500 mt-2">{error.message}</p>}
          {loading && <p className="mt-2">Reservierung wird erstellt...</p>}

          <div className="flex justify-between mt-4">
            <button className="btn btn-outline w-1/2 mr-2" onClick={handlePrev}>
              Zurück
            </button>
            <button className="btn btn-neutral w-1/2 ml-2" onClick={handleNext}>
              Weiter
            </button>
          </div>
        </>
      )}

      {/* Success Modal */}
      {reservationCreated && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Reservierung erfolgreich!</h2>
            <p className="mb-6">Ihre Reservierung wurde erfolgreich erstellt.</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/reservation?id=${reservationCreated.id}`)}
            >
              Reservierungsdetails ansehen
            </button>
          </div>
        </div>
      )}
    </fieldset>
  );
}

