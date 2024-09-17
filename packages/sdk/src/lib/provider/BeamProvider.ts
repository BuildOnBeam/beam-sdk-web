import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { fromHex, toHex } from 'viem';
import { SessionManager } from '../../sessionManager';
import { BeamConfiguration } from '../config';
import TypedEventEmitter from '../utils/typedEventEmitter';
import { JsonRpcError, ProviderErrorCode, RpcErrorCode } from './JsonRpcError';
import {
  JsonRpcRequestCallback,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  Provider,
  ProviderEvent,
  ProviderEventMap,
  RequestArguments,
} from './types';
import { parseAndValidateTypedData } from './utils';

export type BeamProviderInput = {
  config: BeamConfiguration;
  sessionManager: SessionManager;
};

export class BeamProvider implements Provider {
  readonly #config: BeamConfiguration;

  readonly #sessionManager: SessionManager;

  readonly #eventEmitter: TypedEventEmitter<ProviderEventMap>;

  #rpcProvider: StaticJsonRpcProvider;

  // Account abstractions per chainId
  #accounts: Record<number, string> = {};

  public readonly isBeam: boolean = true;

  constructor({ config, sessionManager }: BeamProviderInput) {
    this.#config = config;

    this.#sessionManager = sessionManager;

    this.#rpcProvider = new StaticJsonRpcProvider(
      this.#config.getChainConfig().rpcUrl,
    );

    this.#eventEmitter = new TypedEventEmitter<ProviderEventMap>();
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (this.#accounts[chainId]) {
          return [this.#accounts[chainId]];
        }

        let address: string | null = null;

        try {
          const result = await this.#sessionManager.connect(
            chainId,
            'Connect to Beam SDK',
          );

          if (result) address = result.address;
        } catch (error: unknown) {
          throw new JsonRpcError(
            RpcErrorCode.INTERNAL_ERROR,
            `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }

        if (!address) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            `Unauthorised - no address found for chain: ${chainId}`,
          );
        }

        this.#accounts[chainId] = address;

        this.#eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [address]);

        return [address];
      }

      case 'eth_accounts': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (this.#accounts[chainId]) {
          return [this.#accounts[chainId]];
        }

        let address: string | null = null;

        try {
          const result = this.#sessionManager.getAddress(chainId);
          if (result) address = result;
        } catch {}

        if (!address) return [];

        this.#accounts[chainId] = address;

        return [address];
      }

      case 'eth_sendTransaction': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (!this.#accounts[chainId]) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        // @ts-ignore
        const [transaction] = request.params;

        try {
          const operation = await this.#sessionManager.sendTransaction(
            this.#accounts[chainId],
            chainId,
            transaction,
          );

          return operation.transactions[0].transactionHash;
        } catch (error: unknown) {
          throw new JsonRpcError(
            RpcErrorCode.INTERNAL_ERROR,
            `Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (!this.#accounts[chainId]) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const data = parseAndValidateTypedData(request.params?.[1], chainId);

        try {
          const signature = await this.#sessionManager.signTransaction(
            chainId,
            this.#accounts[chainId],
            data,
          );

          return signature;
        } catch (error: unknown) {
          throw new JsonRpcError(
            RpcErrorCode.INTERNAL_ERROR,
            `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      case 'personal_sign': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (!this.#accounts[chainId]) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }
        try {
          const [message] = request.params as [`0x${string}` | Uint8Array];

          const signature = await this.#sessionManager.signTransaction(
            chainId,
            this.#accounts[chainId],
            message,
          );

          return signature;
        } catch (error: unknown) {
          throw new JsonRpcError(
            RpcErrorCode.INTERNAL_ERROR,
            `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      case 'eth_chainId': {
        const { chainId } = await this.#rpcProvider.detectNetwork();
        return toHex(chainId);
      }

      case 'wallet_switchEthereumChain': {
        const chainId = fromHex(request.params?.[0].chainId, 'number');

        if (!this.#config.chains.find((c) => c.id === chainId)) {
          throw new JsonRpcError(
            RpcErrorCode.INVALID_PARAMS,
            `Chain ${chainId} not found in configuration`,
          );
        }

        try {
          // Disconnect the wallet to enforce a new connection with a new account
          this.disconnect();

          this.#config.setChainId(chainId);

          this.#rpcProvider = new StaticJsonRpcProvider(
            this.#config.getChainConfig().rpcUrl,
          );

          const [address] = await this.#performRequest({
            method: 'eth_requestAccounts',
          });

          return address;
        } catch (error: unknown) {
          throw new JsonRpcError(
            RpcErrorCode.INTERNAL_ERROR,
            `Failed to switch chain: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      case 'wallet_revokePermissions': {
        this.disconnect();
        return;
      }

      // Pass through methods
      case 'eth_gasPrice':
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getStorageAt':
      case 'eth_estimateGas':
      case 'eth_call':
      case 'eth_blockNumber':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionReceipt':
      case 'eth_getTransactionCount': {
        return this.#rpcProvider.send(request.method, request.params || []);
      }
      default: {
        throw new JsonRpcError(
          ProviderErrorCode.UNSUPPORTED_METHOD,
          `${request.method} - Method not supported`,
        );
      }
    }
  }

  async #performJsonRpcRequest(
    request: JsonRpcRequestPayload,
  ): Promise<JsonRpcResponsePayload> {
    const { id, jsonrpc } = request;
    try {
      const result = await this.#performRequest(request);
      return {
        id,
        jsonrpc,
        result,
      };
    } catch (error: unknown) {
      let jsonRpcError: JsonRpcError;
      if (error instanceof JsonRpcError) {
        jsonRpcError = error;
      } else if (error instanceof Error) {
        jsonRpcError = new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          error.message,
        );
      } else {
        jsonRpcError = new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          'Internal error',
        );
      }

      return {
        id,
        jsonrpc,
        error: jsonRpcError,
      };
    }
  }

  public async request(request: RequestArguments): Promise<any> {
    try {
      return this.#performRequest(request);
    } catch (error: unknown) {
      if (error instanceof JsonRpcError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, error.message);
      }

      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Internal error');
    }
  }

  public sendAsync(
    request: JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callback?: JsonRpcRequestCallback,
  ) {
    if (!callback) {
      throw new Error('No callback provided');
    }

    if (Array.isArray(request)) {
      Promise.all(request.map(this.#performJsonRpcRequest))
        .then((result) => {
          callback(null, result);
        })
        .catch((error: JsonRpcError) => {
          callback(error, []);
        });
    } else {
      this.#performJsonRpcRequest(request)
        .then((result) => {
          callback(null, result);
        })
        .catch((error: JsonRpcError) => {
          callback(error, null);
        });
    }
  }

  public async send(
    request: string | JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callbackOrParams?: JsonRpcRequestCallback | Array<any>,
    callback?: JsonRpcRequestCallback,
  ) {
    // Web3 >= 1.0.0-beta.38 calls `send` with method and parameters.
    if (typeof request === 'string') {
      if (typeof callbackOrParams === 'function') {
        return this.sendAsync(
          {
            method: request,
            params: [],
          },
          callbackOrParams,
        );
      }

      if (callback) {
        return this.sendAsync(
          {
            method: request,
            params: Array.isArray(callbackOrParams) ? callbackOrParams : [],
          },
          callback,
        );
      }

      return this.request({
        method: request,
        params: Array.isArray(callbackOrParams) ? callbackOrParams : [],
      });
    }

    // Web3 <= 1.0.0-beta.37 uses `send` with a callback for async queries.
    if (typeof callbackOrParams === 'function') {
      return this.sendAsync(request, callbackOrParams);
    }

    if (!Array.isArray(request) && typeof request === 'object') {
      return this.#performJsonRpcRequest(request);
    }

    throw new JsonRpcError(RpcErrorCode.INVALID_REQUEST, 'Invalid request');
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.#eventEmitter.on(event, listener);
  }

  public removeListener(
    event: string,
    listener: (...args: any[]) => void,
  ): void {
    this.#eventEmitter.removeListener(event, listener);
  }

  public disconnect() {
    this.#sessionManager.clearSession();
    this.#accounts = {};
    this.#eventEmitter.emit('disconnect');
  }
}
