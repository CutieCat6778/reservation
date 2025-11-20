import StatCard from "./StatCard";
import { ReservationInfo } from "@/lib/modelTypes";

interface Props {
  info: ReservationInfo;
}

export default function DashboardStatsGrid({ info }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <StatCard
        title="Offene Reservierungen"
        value={info.totalOpenReservation}
        href="/admin/dashboard/open"
        thresholdGreen={0}
        thresholdYellow={10}
      />
      <StatCard
        title="Bestätigte Reservierungen"
        value={info.totalConfirmedReservation}
        href="/admin/dashboard/confirmed"
        thresholdGreen={0}
        thresholdYellow={360}
      />
      <StatCard
        title="Stornierte Reservierungen"
        value={info.totalCanceledReservation}
        href="/admin/dashboard/canceled"
        thresholdGreen={0}
        thresholdYellow={5}
      />
      <StatCard title="Gesamtreservierungen" value={info.totalReservation} href="/admin/dashboard/total" className="bg-base-200" />
      <StatCard title="Gesamtpersonen" value={info.totalPerson} href="/admin/dashboard" className="bg-base-200" />
      <StatCard title="Große Tische (≥5)" value={info.totalBigReservation} href="/admin/dashboard/big-tables" className="bg-base-200" />
    </div>
  );
}
