import { gql } from "@apollo/client"
import { RESERVATION_FIELDS } from "@/graphql/fragments/reservationFragment";

export const GET_RESERVATION_INFO_TODAY = gql`
  query getReservationInfoToday {
    getReservationInfoToday {
      totalReservation
      totalPerson
      totalOpenReservation
      totalConfirmedReservation
      totalBigReservation
      totalCanceledReservation
      byHours {
        totalReservation
        totalPerson
        totalBigReservation
        startsAt
        endsAt
      }
    }
  }
`
export const GET_BIG_RESERVATION = gql`
  query GetBigReservation {
    getBigReservation {
      ...ReservationFields
    }
  }
  ${RESERVATION_FIELDS}
`;

export const GET_ALL_RESERVATION_TODAY = gql`
  query GetAllReservationToday {
    getReservationToday {
      ...ReservationFields
    }
  }
  ${RESERVATION_FIELDS}
`;

export const GET_ALL_RESERVATION_WITH_FILTER = gql`
  query GetAllReservationWithFilter($filter: ReservationFilter!) {
    getAllReservationWithFilter(filter: $filter) {
      ...ReservationFields
    }
  }
  ${RESERVATION_FIELDS}
`;

