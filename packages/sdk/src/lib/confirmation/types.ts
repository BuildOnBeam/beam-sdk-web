import { Hex } from 'viem';

export const BEAM_EVENT_TYPE = 'beam_confirmation';

export enum ReceiveMessage {
  REQUEST_SESSION_CONFIRMED = 'request_session_confirmed',
  REQUEST_SESSION_ERROR = 'request_session_error',
  REQUEST_SESSION_REJECTED = 'request_session_rejected',

  SIGN_OPERATION_CONFIRMED = 'sign_operation_confirmed',
  SIGN_OPERATION_ERROR = 'sign_operation_error',
  SIGN_OPERATION_REJECTED = 'sign_operation_rejected',

  REQUEST_CONNECTION_CONFIRMED = 'request_connection_confirmed',
  REQUEST_CONNECTION_ERROR = 'request_connection_error',
  REQUEST_CONNECTION_REJECTED = 'request_connection_rejected',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export type RequestConnectionResult = {
  signature: string;
  address: Hex;
  ownerAddress: Hex;
};
