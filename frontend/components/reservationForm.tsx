"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_RESERVATION } from "@/graphql/mutations";
import { LoginWithReservationResponse } from "@/lib/modelTypes"

export default function ReservationForm() {
  const [phase, setPhase] = useState(1);
  const router = useRouter();
  const [success, setSuccess] = useState<{ id: string; token: string } | null>(null);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [persons, setPersons] = useState(2);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");

  const [createReservation, { loading, error }] = useMutation<{createReservation: LoginWithReservationResponse}>(CREATE_RESERVATION);
  const today = new Date().toISOString().slice(0, 10);

  const handleNext = async () => {
    if (phase === 1 && (!date || !time || persons < 1)) return;
    if (phase === 2 && (!email || !phone || phone.length < 9 || !lastName)) return;

    if (phase === 2) {
      const reserveAt = new Date(`${date}T${time}`);
      try {
        const { data } = await createReservation({
          variables: {
            firstName: firstName || null,
            lastName,
            phoneNumber: phone,
            email,
            amount: persons,
            reserveAt: reserveAt.toISOString(),
            notes: message || "",
          },
        });
        const id = data?.createReservation?.reservation?.id;
        const token = data?.createReservation?.token;
        if (id && token) {
          localStorage.setItem("userToken", JSON.stringify({ token, expire: Date.now() + 86400000 }));
          setSuccess({ id, token });
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }
    setPhase(2);
  };

  return (
    <>
      {/* Beautiful DaisyUI Card */}
      <div className="card w-full max-w-2xl mx-1 sm:mx-auto bg-base-100 shadow-2xl rounded-3xl overflow-hidden">
        {/* Progress */}
        <div className="w-full bg-base-300 h-2">
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: phase === 1 ? "50%" : "100%" }}
          />
        </div>

        <div className="card-body p-8 sm:p-10 gap-8">
          {/* Phase 1 */}
          {phase === 1 && (
            <div className="space-y-8">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Datum</span></label>
                <br/>
                <input type="date" className="input input-bordered input-lg rounded-xl" value={date} min={today}
                       onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Uhrzeit</span></label>
                <br/>
                <input type="time" className="input input-bordered input-lg rounded-xl" value={time}
                       onChange={(e) => setTime(e.target.value)} />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Personenanzahl</span></label>
                <br/>
                <input type="number" className="input input-bordered input-lg rounded-xl" value={persons} min="1"
                       onChange={(e) => setPersons(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>

              <button onClick={handleNext} className="btn btn-black btn-lg w-full rounded-xl">
                Weiter
              </button>
            </div>
          )}

          {/* Phase 2 */}
          {phase === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="form-control sm:block flex justify-between items-center">
                  <label className="label"><span className="label-text font-medium">Email *</span></label>
                  <input type="email" placeholder="max@mustermann.de" className="input input-bordered input-lg rounded-xl"
                         value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-control sm:block flex justify-between items-center">
                  <label className="label"><span className="label-text font-medium">Telefon *</span></label>
                  <input type="tel" placeholder="0176 12345678" className="input input-bordered input-lg rounded-xl"
                         value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Vorname</span></label>
                  <input type="text" className="input input-bordered input-lg rounded-xl"
                         value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Nachname *</span></label>
                  <input type="text" className="input input-bordered input-lg rounded-xl"
                         value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Nachricht (optional)</span></label>
                <br/>
                <textarea className="textarea textarea-bordered h-28 rounded-xl resize-none w-full"
                          placeholder="Allergien, besondere Wünsche…" value={message}
                          onChange={(e) => setMessage(e.target.value)} />
              </div>

              {error && <div className="alert alert-error shadow-lg"><span>{error.message}</span></div>}
              {loading && <span className="loading loading-spinner loading-lg mx-auto"></span>}

              <div className="flex gap-4 mt-6">
                <button onClick={() => setPhase(1)} className="btn btn-ghost btn-lg flex-1 rounded-xl">
                  Zurück
                </button>
                <button onClick={handleNext} disabled={loading}
                        className="btn btn-black btn-lg flex-1 rounded-xl">
                  {loading ? <span className="loading loading-spinner"></span> : "Reservieren"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal – pure DaisyUI */}
      {success && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box text-center">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="font-bold text-2xl mb-3">Reservierung erfolgreich!</h3>
            <p className="text-base-content/70 mb-8">Wir haben Ihre Angaben erhalten und senden Ihnen in Kürze eine Bestätigung per E-Mail zu. Wir freuen uns auf Ihren Besuch.</p>
            <div className="modal-action justify-center">
              <button className="btn btn-black btn-lg rounded-xl"
                      onClick={() => router.push(`/reservation?id=${success.id}`)}>
                Zur Reservierung
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
