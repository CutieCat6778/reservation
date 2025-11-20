import { ReservationStatus } from "@/lib/modelTypes";

interface Props {
  status: ReservationStatus;
}

const statusMap = {
  [ReservationStatus.OPEN]: { label: "Offen", color: "badge-warning" },
  [ReservationStatus.CONFIRMED]: { label: "Bestätigt", color: "badge-success" },
  [ReservationStatus.CANCELED]: { label: "Storniert", color: "badge-error" },
  [ReservationStatus.DECLINED]: { label: "Abgelehnt", color: "badge-error" },
};

export default function ReservationStatusBadge({ status }: Props) {
  const { label, color } = statusMap[status];
  return <span className={`badge ${color} badge-lg`}>{label}</span>;
}
