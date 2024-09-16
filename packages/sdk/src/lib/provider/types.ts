import { JsonRpcError } from './JsonRpcError';

// https://eips.ethereum.org/EIPS/eip-712
export interface TypedDataPayload {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  primaryType: string;
  message: Record<string, any>;
}

export interface RequestArguments {
  method: string;
  params?: Array<any>;
}

export type JsonRpcRequestPayload = RequestArguments & {
  jsonrpc?: string;
  id?: string | number;
};

export interface JsonRpcRequestCallback {
  // biome-ignore lint/style/useShorthandFunctionType: prefer long form for clarity
  (
    err: JsonRpcError | null,
    result?: JsonRpcResponsePayload | (JsonRpcResponsePayload | null)[] | null,
  ): void;
}

export interface JsonRpcResponsePayload {
  result?: Array<any> | null;
  error?: JsonRpcError | null;
  jsonrpc?: string;
  id?: string | number;
}

export type Provider = {
  request: (request: RequestArguments) => Promise<any>;
  sendAsync: (
    request: JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callback: JsonRpcRequestCallback,
  ) => void;
  send: (
    request: string | JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callbackOrParams?: JsonRpcRequestCallback | Array<any>,
    callback?: JsonRpcRequestCallback,
  ) => void;
  on: (event: string, listener: (...args: any[]) => void) => void;
  removeListener: (event: string, listener: (...args: any[]) => void) => void;
  isBeam: boolean;
};

export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
}

export type AccountsChangedEvent = Array<string>;

export interface ProviderEventMap extends Record<string, any> {
  [ProviderEvent.ACCOUNTS_CHANGED]: [AccountsChangedEvent];
}

/**
 * Event detail from the `eip6963:announceProvider` event.
 */
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Provider;
}

/**
 * Metadata of the EIP-1193 Provider.
 */
export interface EIP6963ProviderInfo {
  icon: `data:image/${string}`; // RFC-2397
  name: string;
  rdns: string;
  uuid: string;
}

/**
 * Event type to announce an EIP-1193 Provider.
 */
export interface EIP6963AnnounceProviderEvent
  extends CustomEvent<EIP6963ProviderDetail> {
  type: 'eip6963:announceProvider';
}
