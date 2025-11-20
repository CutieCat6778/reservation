export type LoginWithReservationResponse = {
  token: string;
  reservation?: Reservation;
};

export type NewReservation = {
  firstName?: string | null;
  lastName: string;
  amount: number;
  phoneNumber: string;
  email: string;
  reserveAt: string; // ISO string
  notes?: string | null;
};

export type Reservation = {
  id: string;
  firstName?: string | null;
  lastName: string;
  phoneNumber: string;
  email: string;
  amount: number;
  createdAt: string; // ISO string
  reserveAt: string; // ISO string
  status: ReservationStatus;
  notes?: string | null;
};

export type ReservationEventPayload = {
  reservation: Reservation;
  event: ReservationEventBroadcast;
};

export type ReservationFilter = {
  firstName?: string | null;
  lastName?: string | null;
  id?: string | null;
  status?: ReservationStatus | null;
  dateFrom?: string | null; // ISO string
  dateTo?: string | null; // ISO string
  email?: string | null;
  phoneNumber?: string | null;
};

export type ReservationInfo = {
  totalReservation: number;
  totalPerson: number;
  totalOpenReservation: number;
  totalBigReservation: number;
  totalConfirmedReservation: number;
  totalCanceledReservation: number;
  byHours: ReservationInfoByHour[];
};

export type ReservationInfoByHour = {
  totalReservation: number;
  totalPerson: number;
  totalBigReservation: number;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
};

export type UpdateReservation = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  amount?: number | null;
  reserveAt?: string | null;
  notes?: string | null;
};

// Enums
export enum ReservationEventBroadcast {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  CANCELED = "CANCELED",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
}

export enum ReservationStatus {
  OPEN = "OPEN",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
  DECLINED = "DECLINED",
}

