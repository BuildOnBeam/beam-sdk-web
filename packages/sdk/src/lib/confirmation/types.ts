import { Hex } from 'viem';

export const BEAM_EVENT_TYPE = 'beam_sdk_event';

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',

  REQUEST_SESSION_CONFIRMED = 'request_session_confirmed',
  REQUEST_SESSION_ERROR = 'request_session_error',
  REQUEST_SESSION_REJECTED = 'request_session_rejected',

  SIGN_OPERATION_CONFIRMED = 'sign_operation_confirmed',
  SIGN_OPERATION_ERROR = 'sign_operation_error',
  SIGN_OPERATION_REJECTED = 'sign_operation_rejected',

  REQUEST_MESSAGE_SIGNATURE_CONFIRMED = 'request_message_signature_confirmed',
  REQUEST_MESSAGE_SIGNATURE_ERROR = 'request_message_signature_error',
  REQUEST_MESSAGE_SIGNATURE_REJECTED = 'request_message_signature_rejected',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export type RequestConnectionResult = {
  signature: string;
  address: Hex;
  ownerAddress: Hex;
};
