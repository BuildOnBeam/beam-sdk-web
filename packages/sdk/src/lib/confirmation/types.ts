export enum SendMessage {
  REQUEST_SESSION_START = 'request_session_start',
  SIGN_OPERATION_START = 'sign_operation_start',
}

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',

  REQUEST_SESSION_CONFIRMED = 'request_session_confirmed',
  REQUEST_SESSION_ERROR = 'request_session_error',
  REQUEST_SESSION_REJECTED = 'request_session_rejected',

  SIGN_OPERATION_CONFIRMED = 'sign_operation_confirmed',
  SIGN_OPERATION_ERROR = 'sign_operation_error',
  SIGN_OPERATION_REJECTED = 'sign_operation_rejected',
}

export type ConfirmationResult = {
  confirmed: boolean;
};

export const BEAM_EVENT_TYPE = 'beam_confirmation';
