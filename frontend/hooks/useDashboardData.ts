import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { GET_RESERVATION_INFO_TODAY } from "@/graphql/queries";
import { ReservationInfo } from "@/lib/modelTypes";

export const useDashboardData = () => {
  const [token, setToken] = useState<string | null>(null);

  const [fetch, { data, loading, error, refetch }] = useLazyQuery<{
    getReservationInfoToday: ReservationInfo;
  }>(GET_RESERVATION_INFO_TODAY, { fetchPolicy: "network-only" });

  useEffect(() => {
    const stored = localStorage.getItem("adminToken");
    if (stored) {
      try {
        const { token } = JSON.parse(stored) as { token: string };
        setToken(token);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetch({
        context: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }, [token, fetch]);

  const info = data?.getReservationInfoToday;

  return {
    info,
    loading,
    error,
    refetch: () => refetch?.({ context: { headers: { Authorization: `Bearer ${token}` } } }),
  };
};
