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

export const CONFIRM_RESERVATION = gql`
  mutation ConfirmReservation($id: ID!) {
    confirmReservation(id: $id) {
      id
      status
    }
  }
`;

export const DECLINE_RESERVATION = gql`
  mutation DeclineReservation($id: ID!) {
    declineReservation(id: $id) {
      id
      status
    }
  }
`;

export const UPDATE_RESERVATION = gql`
  mutation UpdateReservation($input: UpdateReservation!) {
    updateReservation(input: $input) {
      id
      status
      reserveAt
    }
  }
`;

export const SEND_MESSAGE_TO_RESERVATION = gql`
  mutation SendMessageToReservation($id: ID!, $content: String!) {
    sendMessageToReservation(id: $id, content: $content)
  }
`;

export const LOGIN_WITH_RESERVATION = gql`
  mutation LoginWithReservation($id: ID!, $lastName: String!) {
    loginWithReservation(id: $id, lastName: $lastName) {
      token
      reservation {
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
    }
  }
`;

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($id: ID!) {
    cancelReservation(id: $id) {
      id
      status
    }
  }
`;
