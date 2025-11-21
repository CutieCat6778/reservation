import { Reservation } from "@/lib/modelTypes";
import { formatDate, formatTime } from "@/lib/utils";
import ReservationStatusBadge from "@/components/ReservationStatusBadge"

interface Props {
  reservation: Reservation;
  expanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onOpen: () => void;
  onChangeTime: () => void;
}

export default function ReservationList({
  reservation,
  expanded,
  onToggle,
  onConfirm,
  onDecline,
  onOpen,
  onChangeTime,
}: Props) {
  const isBig = reservation.amount >= 5;

  return (
    <div className={`shadow ${isBig ? "bg-red-100" : "bg-base-200"} px-4 py-2`}>
      <div className="">
        <div className="cursor-pointer" onClick={onToggle}>
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex items-center">
                <h2 className="card-title mr-2">{reservation.firstName} {reservation.lastName}</h2>
                <p className="text-sm mr-2">{reservation.amount} Personen</p>
                <span className="mr-2">{formatTime(reservation.reserveAt)}</span>
              </div>
              <div className="text-sm font-semibold flex items-center">
                <ReservationStatusBadge status={reservation.status}/>
              </div>
            </div>
            <svg className={`w-6 h-6 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Details */}
            {["phoneNumber", "email", "notes"].map(field => (
              <div key={field}>
                <p className="text-sm font-semibold">{field === "phoneNumber" ? "Telefon" : field === "email" ? "E-Mail" : "Notizen"}:</p>
                <p className="text-sm">{reservation[field as keyof Reservation] || "–"}</p>
              </div>
            ))}
            <p className="text-sm"><strong>Erstellt:</strong> {formatDate(reservation.createdAt)}</p>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-warning btn-sm" onClick={onOpen} disabled={reservation.status === "OPEN"}>Offen</button>
              <button className="btn btn-success btn-sm" onClick={onConfirm} disabled={reservation.status === "CONFIRMED"}>Bestätigen</button>
              <button className="btn btn-error btn-sm" onClick={onDecline} disabled={["CANCELED", "DECLINED"].includes(reservation.status)}>Ablehnen</button>
              <button className="btn btn-outline btn-sm" onClick={onChangeTime}>Zeit ändern</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
