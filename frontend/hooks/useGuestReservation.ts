import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import {
  LOGIN_WITH_RESERVATION,
  UPDATE_RESERVATION,
  CANCEL_RESERVATION,
} from "@/graphql/mutations";
import { Reservation, ReservationStatus, LoginWithReservationResponse } from "@/lib/modelTypes";

export const useGuestReservation = () => {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lastNameInput, setLastNameInput] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const [login] = useMutation<{loginWithReservation: LoginWithReservationResponse}>(LOGIN_WITH_RESERVATION);
  const [update] = useMutation<{updateReservation: Reservation}>(UPDATE_RESERVATION);
  const [cancel] = useMutation<{cancelReservation: Reservation}>(CANCEL_RESERVATION);

  useEffect(() => {
    const stored = localStorage.getItem("userToken");
    if (stored) {
      try {
        const { token: t, expire } = JSON.parse(stored);
        if (expire > Date.now()) {
          setToken(t);
          // Optionally auto-fetch reservation if token is valid
        } else {
          localStorage.removeItem("userToken");
        }
      } catch {}
    }
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async () => {
    if (!reservationId || !lastNameInput) return;
    try {
      const { data } = await login({
        variables: { id: reservationId, lastName: lastNameInput },
      });
      const result = data?.loginWithReservation;
      if (!result || !result.reservation) throw new Error("Invalid response");

      localStorage.setItem("userToken", JSON.stringify({ token: result.token, expire: Date.now() + 24 * 60 * 60 * 1000 }));
      setToken(result.token);
      setReservation(result.reservation);
      setShowAuthModal(false);
      showNotification("Erfolgreich angemeldet!");
    } catch (err) {
      showNotification("Falscher Nachname oder Reservierung nicht gefunden");
    }
  };

  const handleUpdate = async (field: keyof Reservation, value: string | number | null) => {
    if (!reservation || !token) return;
    try {
      const { data } = await update({
        variables: { input: { id: reservation.id, [field]: value } },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      if (data?.updateReservation) {
        setReservation(data.updateReservation);
        showNotification("Änderung gespeichert");
      }
    } catch (err) {
      showNotification("Fehler beim Speichern");
    }
  };
  const handleCancel = async () => {
    if (!reservation || !token) return;
    try {
      await cancel({
        variables: { id: reservation.id },
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
      setReservation({ ...reservation, status: ReservationStatus.CANCELED });
      showNotification("Reservierung storniert");
    } catch {
      showNotification("Fehler beim Stornieren");
    }
  };

  return {
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
  };
};
