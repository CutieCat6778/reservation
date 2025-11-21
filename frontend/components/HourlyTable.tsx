import { useState, useEffect, Fragment } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { formatTime, formatLocalDateTime } from "@/lib/utils";
import { GET_ALL_RESERVATION_WITH_FILTER } from "@/graphql/queries";
import { Reservation } from "@/lib/modelTypes";
import ReservationList from "@/components/ReservationList";
import NotificationToast from "@/components/NotificationToast";

interface HourRow {
  startsAt: string;
  endsAt: string;
  totalReservation: number;
  totalBigReservation: number;
  totalPerson: number;
}

interface Props {
  hours: HourRow[];
  onConfirm: (id: string) => Promise<void>;
  onDecline: (reservation: Reservation) => void;
  onOpen: (id: string) => Promise<void>;
  onChangeTime: (reservation: Reservation) => void;
}

export default function HourlyTable({ hours, onConfirm, onDecline, onOpen, onChangeTime }: Props) {
  const [now, setNow] = useState(new Date());
  const [expandedHourIndex, setExpandedHourIndex] = useState<number | null>(null);
  const [expandedReservationId, setExpandedReservationId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fetchReservations, { data, loading, error, refetch }] = useLazyQuery<
  { getAllReservationWithFilter: Reservation[] }
>(GET_ALL_RESERVATION_WITH_FILTER, { fetchPolicy: "network-only" });

  useEffect(() => {
    console.log(error)
    if (error) setErrorMessage("Fehler beim Laden der Reservierungen");
  }, [error]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
    if (expandedHourIndex !== null && token) {
      const hour = hours[expandedHourIndex];

      const dateFrom = new Date(hour.startsAt);
      const dateTo = new Date(hour.endsAt);
      dateTo.setSeconds(dateTo.getSeconds() - 1); // subtract 1 second

      console.log("Fetching", dateFrom, dateTo);

      fetchReservations({
        variables: {
          filter: {
            dateFrom: formatLocalDateTime(dateFrom),
            dateTo: formatLocalDateTime(dateTo),          },
        },
        context: { headers: { Authorization: `Bearer ${token}` } },
      }).catch(() => setErrorMessage("Fehler beim Laden der Reservierungen"));
    }
  }, [expandedHourIndex, token, hours, fetchReservations]);
  const reservations: Reservation[] = data?.getAllReservationWithFilter || [];
  const sortedReservations = [...reservations].sort((a, b) => b.amount - a.amount);

  const wrap = async (fn: () => Promise<void>) => {
    try {
      await fn();
      await refetch();
    } catch {
      setErrorMessage("Ein Fehler ist aufgetreten");
    }
  };

  return (
    <div className="overflow-x-auto">
      <NotificationToast message={errorMessage} onClose={() => setErrorMessage(null)} />
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Uhrzeit</th>
            <th>Reservierungen</th>
            <th>Große Tische</th>
            <th>Personen</th>
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, i) => {
            const start = new Date(hour.startsAt).getTime();
            const end = new Date(hour.endsAt).getTime();
            const nowTime = now.getTime();

            const isCurrentHour = nowTime >= start && nowTime < end;            
            const isExpanded = expandedHourIndex === i;

            return (
              <Fragment key={`hour-${i}`}>
                <tr
                  className={`cursor-pointer ${isCurrentHour ? "bg-yellow-100 font-bold" : ""}`}
                  onClick={() => setExpandedHourIndex(isExpanded ? null : i)}
                >
                  <td className="flex items-center gap-2">
                    {formatTime(hour.startsAt)}
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                  <td>{hour.totalReservation}</td>
                  <td>{hour.totalBigReservation}</td>
                  <td>{hour.totalPerson}</td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="bg-base-300">
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <span className="loading loading-spinner loading-md"></span>
                          </div>
                        ) : sortedReservations.length === 0 ? (
                            <p className="text-sm text-center">Keine Reservierungen in diesem Zeitraum</p>
                          ) : (
                              sortedReservations.map((r) => (
                                <ReservationList
                                  key={r.id}
                                  reservation={r}
                                  expanded={expandedReservationId === r.id}
                                  onToggle={() =>
                                    setExpandedReservationId(expandedReservationId === r.id ? null : r.id)
                                  }
                                  onConfirm={() => wrap(() => onConfirm(r.id))}
                                  onDecline={() => wrap(() => Promise.resolve(onDecline(r)))}
                                  onOpen={() => wrap(() => onOpen(r.id))}
                                  onChangeTime={() => wrap(() => Promise.resolve(onChangeTime(r)))}
                                />
                              ))
                            )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

