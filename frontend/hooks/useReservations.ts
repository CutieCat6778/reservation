import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import {
  GET_BIG_RESERVATION,
  GET_ALL_RESERVATION_TODAY,
  GET_ALL_RESERVATION_WITH_FILTER, } from "@/graphql/queries";
import {
  CONFIRM_RESERVATION,
  DECLINE_RESERVATION,
  UPDATE_RESERVATION,
  SEND_MESSAGE_TO_RESERVATION,
  OPEN_RESERVATION,
} from "@/graphql/mutations";
import { Reservation } from "@/lib/modelTypes";

const QUERY_MAP = {
  "big-tables": { query: GET_BIG_RESERVATION, dataKey: "getBigReservation", useFilter: false },
  total: { query: GET_ALL_RESERVATION_TODAY, dataKey: "getReservationToday", useFilter: false },
  open: { query: GET_ALL_RESERVATION_WITH_FILTER, dataKey: "getAllReservationWithFilter", useFilter: true, status: "OPEN" },
  confirmed: { query: GET_ALL_RESERVATION_WITH_FILTER, dataKey: "getAllReservationWithFilter", useFilter: true, status: "CONFIRMED" },
  canceled: { query: GET_ALL_RESERVATION_WITH_FILTER, dataKey: "getAllReservationWithFilter", useFilter: true, status: "CANCELED" },
} as const;

type Slug = keyof typeof QUERY_MAP;

export const useReservations = (slug: string) => {
  const [token, setToken] = useState<string | null>(null);

  const config = QUERY_MAP[slug as Slug];
  if (!config) throw new Error("Invalid slug");

  const [fetchReservations, { data, loading, error, refetch }] = useLazyQuery(
    config.query,
    { fetchPolicy: "network-only" }
  );

  const [confirm] = useMutation(CONFIRM_RESERVATION);
  const [decline] = useMutation(DECLINE_RESERVATION);
  const [update] = useMutation(UPDATE_RESERVATION);
  const [sendMessage] = useMutation(SEND_MESSAGE_TO_RESERVATION);
  const [openReservation] = useMutation(OPEN_RESERVATION);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (t) {
      try {
        const parsed = JSON.parse(t) as { token: string };
        setToken(parsed.token);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (token && config) {
      const variables = config.useFilter ? { filter: { status: config.status } } : undefined;
      fetchReservations({
        variables,
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [token, config, fetchReservations]);

  const reservations: Reservation[] = data?.[config.dataKey as keyof typeof data] || [];

  const authContext = { context: { headers: { Authorization: `Bearer ${token}` } } };

  return {
    reservations,
    loading,
    error,
    refetch,
    openReservation: (id: string) => openReservation({ variables: { id }, ...authContext }),
    confirm: (id: string) => confirm({ variables: { id }, ...authContext }),
    decline: (id: string) => decline({ variables: { id }, ...authContext }),
    update: (input: any) => update({ variables: { input }, ...authContext }),
    sendMessage: (id: string, content: string) =>
      sendMessage({ variables: { id, content }, ...authContext }),
  };
};
