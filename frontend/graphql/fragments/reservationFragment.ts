import { gql } from "@apollo/client";

export const RESERVATION_FIELDS = gql`
  fragment ReservationFields on Reservation {
    id
    firstName
    lastName
    phoneNumber
    email
    amount
    createdAt
    reserveAt
    status
    notes
  }
`;
