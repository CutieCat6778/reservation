import { gql } from "@apollo/client"

export const CREATE_RESERVATION = gql`
mutation CreateReservation($firstName: String, $lastName: String!, $phoneNumber: String!, $email: String!, $amount: Int!, $reserveAt: Time!, $notes: String!) {
  createReservation(input: {
    firstName: $firstName 
    lastName: $lastName 
    phoneNumber: $phoneNumber 
    email: $email 
    amount: $amount 
    reserveAt: $reserveAt 
    notes: $notes 
  }) {
    token
    reservation {
      id
      firstName
      lastName
      amount
      createdAt
      reserveAt
      status
      notes
    }
  }
}
`

export const LOGIN_ADMIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`
