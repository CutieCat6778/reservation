import { gql } from "@apollo/client"

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
