import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { toHex } from 'viem';
import { SessionManager } from '../../sessionManager';
import { getPlayerAPI } from '../api/beam.api.generated';
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

export type BeamProviderInput = {
  config: BeamConfiguration;
  sessionManager: SessionManager;
};

export class BeamProvider implements Provider {
  readonly #config: BeamConfiguration;

  readonly #sessionManager: SessionManager;

  readonly #eventEmitter: TypedEventEmitter<ProviderEventMap>;

  readonly #rpcProvider: StaticJsonRpcProvider;

  readonly api = getPlayerAPI();

  // Account abstractions per chainId
  #accountAddress: Record<number, string> = {};

  public readonly isBeam: boolean = true;

  constructor({ config, sessionManager }: BeamProviderInput) {
    this.#config = config;

    this.#sessionManager = sessionManager;

    this.#rpcProvider = new StaticJsonRpcProvider(this.#config.rpcUrl);

    this.#eventEmitter = new TypedEventEmitter<ProviderEventMap>();
  }

  async #performRequest(request: RequestArguments): Promise<any> {
    switch (request.method) {
      case 'eth_requestAccounts': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (this.#accountAddress[chainId]) {
          return [this.#accountAddress[chainId]];
        }

        let address: string | null = null;

        try {
          address = await this.#sessionManager.getAddress(
            chainId,
            'Connect to Beam SDK',
          );
        } catch (error: unknown) {
          console.error(error);

          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - unable to get address',
          );
        }

        if (!address) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            `Unauthorised - no wallet address found for chain: ${chainId}`,
          );
        }

        this.#accountAddress[chainId] = address;

        this.#eventEmitter.emit(ProviderEvent.ACCOUNTS_CHANGED, [address]);

        return [address];
      }

      case 'eth_sendTransaction': {
        return '';

        // const entityId = await this.#authManager.getUserId();

        // if (!address) {
        //   throw new JsonRpcError(
        //     ProviderErrorCode.UNAUTHORIZED,
        //     'Unauthorised - call eth_requestAccounts first',
        //   );
        // }

        // const { to, value, data } = request.params?.[0] ?? {};

        // const abi = parseAbi([
        //   'function setApprovalForAll(address to, bool approved)',
        // ]);

        // const result = decodeFunctionData({
        //   abi,
        //   data,
        // });

        // const operationPayload = {
        //   chainId,
        //   interactions: [
        //     {
        //       functionName: result.functionName,
        //       functionArgs: result.args,
        //       contractAddress: to,
        //       value,
        //     },
        //   ],
        //   sponsor: false,
        // };

        // const operation = await this.api.createUserTransaction(
        //   entityId,
        //   // @ts-ignore
        //   operationPayload,
        // );

        // if (!operation) {
        //   throw new Error('Failed to create user transaction.');
        // }

        // const signed = await this.#sessionManager.signOperation(
        //   entityId,
        //   operation.id,
        //   chainId,
        // );

        // if (!signed) {
        //   throw new JsonRpcError(
        //     ProviderErrorCode.UNSUPPORTED_METHOD,
        //     'Method not supported',
        //   );
        // }

        // return operation.transactions[0].hash;
      }

      case 'eth_accounts': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        return this.#accountAddress[chainId]
          ? [this.#accountAddress[chainId]]
          : [];
      }

      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const { chainId } = await this.#rpcProvider.detectNetwork();

        if (!this.#accountAddress[chainId]) {
          throw new JsonRpcError(
            ProviderErrorCode.UNAUTHORIZED,
            'Unauthorised - call eth_requestAccounts first',
          );
        }

        const signature = await this.#sessionManager.requestSignature(
          chainId,
          request.params?.[1],
        );

        return signature;
      }

      // TODO - implement personal_sign (SIWE)
      // case 'personal_sign': {
      //   const { chainId } = await this.#rpcProvider.detectNetwork();

      //   if (!this.#accountAddress[chainId]) {
      //     throw new JsonRpcError(
      //       ProviderErrorCode.UNAUTHORIZED,
      //       'Unauthorised - call eth_requestAccounts first',
      //     );
      //   }

      //   // @ts-ignore
      //   const [message] = request.params;

      //   const signature = await this.#sessionManager.signMessage(
      //     chainId,
      //     message,
      //   );

      //   return signature;
      // }

      case 'eth_chainId': {
        const { chainId } = await this.#rpcProvider.detectNetwork();
        return toHex(chainId);
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
}
