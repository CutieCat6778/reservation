import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";

interface HourRow {
  startsAt: string;
  endsAt: string;
  totalReservation: number;
  totalBigReservation: number;
  totalPerson: number;
}

interface Props {
  hours: HourRow[];
}

export default function HourlyTable({ hours }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto">
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
            const isCurrentHour =
              now >= new Date(hour.startsAt) && now < new Date(hour.endsAt);

            return (
              <tr key={i} className={isCurrentHour ? "bg-yellow-100 font-bold" : ""}>
                <td>{formatTime(hour.startsAt)}</td>
                <td>{hour.totalReservation}</td>
                <td>{hour.totalBigReservation}</td>
                <td>{hour.totalPerson}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
