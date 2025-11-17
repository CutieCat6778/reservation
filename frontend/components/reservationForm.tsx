"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_RESERVATION } from "@/graphql/mutations"; // import your mutation

export default function ReservationForm() {
  const [phase, setPhase] = useState(1);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [persons, setPersons] = useState(2);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");

  const [createReservation, { loading, error }] = useMutation(CREATE_RESERVATION);

  const handleNext = async () => {
    if (phase === 1 && (!date || !time || persons < 1)) return;
    if (
      phase === 2 &&
      (!email || !phone || phone.length < 10 || !lastName)
    )
      return;

    if (phase === 2) {
      // combine date + time
      const reserveAt = new Date(`${date}T${time}`);
      try {
        await createReservation({
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
      } catch (e) {
        console.error("Error creating reservation:", e);
        return;
      }
    }

    setPhase(phase + 1);
  };

  const handlePrev = () => setPhase(phase - 1);

  const progressValue = phase === 1 ? 33 : phase === 2 ? 66 : 100;
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

      {phase === 3 && (
        <div className="text-center py-8">
          <h2 className="text-xl font-bold mb-4">Danke für Ihre Reservierung!</h2>
          <p>Bitte prüfen Sie Ihre E-Mails für die Bestätigung.</p>
        </div>
      )}
    </fieldset>
  );
}

