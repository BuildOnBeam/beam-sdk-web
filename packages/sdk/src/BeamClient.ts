import { serializeSignature } from 'viem';
import { generatePrivateKey, privateKeyToAccount, sign } from 'viem/accounts';
import { AXIOS_INSTANCE } from './lib/api/beam-axios-client';
import { getPlayerAPI } from './lib/api/beam.api.generated';
import {
  CommonOperationResponse,
  CommonOperationResponseStatus,
  ConfirmOperationRequestStatus,
  ConfirmOperationRequestTransactionsItem,
  GenerateSessionRequestResponse,
} from './lib/api/beam.types.generated';
import { BeamConfiguration } from './lib/config';
import { ConfirmationScreen } from './lib/confirmation';
import { StorageKey, StorageKeys, StorageService } from './lib/storage';
import { ClientConfig, Session } from './types';
import { isSessionOwnedBy, isSessionValid } from './utils';

export class BeamClient {
  readonly #config: BeamConfiguration;
  readonly #confirm: ConfirmationScreen;

  #storage = new StorageService<StorageKeys>(window.sessionStorage);

  readonly api = getPlayerAPI();

  constructor(config: ClientConfig) {
    this.#config = new BeamConfiguration(config);

    this.#confirm = new ConfirmationScreen(this.#config);

    AXIOS_INSTANCE.interceptors.request.use((config) => {
      config.baseURL = this.#config.apiUrl;
      config.headers.set('x-api-key', this.#config.publishableKey);
      return config;
    });
  }

  public setStorage(storage: Storage) {
    this.#storage = new StorageService<StorageKeys>(storage);
  }

  /**
   * Get the active session. If there is no active session, it will throw an error.
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Session
   */
  public async getActiveSession(entityId: string, chainId: number) {
    const { session } = await this.getActiveSessionAndKeys(entityId, chainId);

    if (!session) {
      this.log('Unable to get active session');

      this.#storage.clear();

      throw new Error('No active session found');
    }

    this.log('Got active session');

    return session;
  }

  /**
   * Create a new session. If there is an active session, it will throw an error.
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Session
   */
  public async createSession(entityId: string, chainId: number) {
    let { session, key } = await this.getActiveSessionAndKeys(
      entityId,
      chainId,
    );

    if (session) {
      this.log('Already has an active session, ending early');

      throw new Error('Already has an active session');
    }

    this.log('Creating a new session');

    key = this.getOrCreateSigningKey(true);

    let sessionRequest: GenerateSessionRequestResponse | null = null;

    try {
      const account = privateKeyToAccount(key as `0x${string}`);

      sessionRequest = await this.api.createSessionRequest(entityId, {
        chainId,
        address: account.address,
      });
    } catch (error: unknown) {
      this.log(
        `Failed to create session request: ${
          error instanceof Error ? error.message : 'Unknown error.'
        }`,
      );
    }

    if (!sessionRequest) {
      this.log('Failed to create session request');

      throw new Error('Failed to create session request');
    }

    this.log(`Created session request: ${sessionRequest.id}`);

    let error: string | null = null;

    try {
      this.log(`Confirming session request: ${sessionRequest.id}`);

      // TODO add timeout

      const result = await this.#confirm.requestSession(sessionRequest.url);

      this.log(`Session request confirmed: ${result.confirmed}`);

      if (!result.confirmed) {
        throw new Error('Unable to confirm session request');
      }
    } catch (err: unknown) {
      this.log(
        `Failed to confirm session request: ${
          err instanceof Error ? err.message : 'Unknown error.'
        }`,
      );

      error = err instanceof Error ? err.message : 'Unknown error.';
    }

    if (error) throw new Error(error);

    return this.getActiveSession(entityId, chainId);
  }

  /**
   * Clear the current session
   * @param entityId
   * @param chainId
   */
  public async clearSession() {
    this.#storage.clear();
  }

  /**
   * Sign an operation by its id
   * @param entityId
   * @param operationId
   * @param chainId
   * @throws Error
   * @returns boolean
   */
  public async signOperation(
    entityId: string,
    operationId: string,
    chainId: number,
    useBrowserFallback = false,
  ) {
    const { session, key } = await this.getActiveSessionAndKeys(
      entityId,
      chainId,
    );

    this.log('Retrieving operation');

    let operation: CommonOperationResponse | null = null;

    try {
      const result = await this.api.getOperation(operationId);

      if (result) operation = result;
    } catch (error: unknown) {
      this.log(
        `Failed to get operation: ${
          error instanceof Error ? error.message : 'Unknown error.'
        }`,
      );
    }

    if (!operation) {
      this.log('Failed to get operation');

      throw new Error('Failed to get operation');
    }

    if (session && key) {
      return this.signOperationUsingSession(operation, entityId, key);
    }

    if (useBrowserFallback) {
      return this.signOperationUsingBrowser(operation);
    }

    throw new Error(
      'Unable to sign operation, no valid session or key found and no browser fallback enabled.',
    );
  }

  private async signOperationUsingSession(
    operation: CommonOperationResponse,
    entityId: string,
    key: string,
  ) {
    if (!operation.transactions.length) {
      throw new Error('No transactions found in operation');
    }

    let error: string | null = null;

    const transactions: ConfirmOperationRequestTransactionsItem[] = [];

    for (const transaction of operation.transactions) {
      try {
        const signature = serializeSignature(
          await sign({
            hash: transaction.hash as `0x${string}`,
            privateKey: key as `0x${string}`,
          }),
        );

        transactions.push({
          id: transaction.id,
          signature,
        });
      } catch (err: unknown) {
        this.log(
          `Failed to sign transaction: ${
            err instanceof Error ? err.message : 'Unknown error.'
          }`,
        );

        error = err instanceof Error ? err.message : 'Unknown error.';
      }
    }

    if (error) throw new Error(error);

    try {
      const result = await this.api.processOperation(operation.id, {
        entityId,
        gameId: operation.gameId,
        status: ConfirmOperationRequestStatus.Pending,
        transactions,
      });

      const hasFailed =
        result.status !== CommonOperationResponseStatus.Executed &&
        result.status !== CommonOperationResponseStatus.Signed &&
        result.status !== CommonOperationResponseStatus.Pending;

      if (hasFailed) {
        throw new Error(`Operation failed with status: ${result.status}`);
      }

      this.log(`Operation signed: ${result.status}`);
    } catch (err: unknown) {
      this.log(
        `Failed to sign operation: ${
          err instanceof Error ? err.message : 'Unknown error.'
        }`,
      );

      error = err instanceof Error ? err.message : 'Unknown error.';
    }

    if (error) throw new Error(error);

    return true;
  }

  private async signOperationUsingBrowser(operation: CommonOperationResponse) {
    let error: string | null = null;

    try {
      this.log(`Signing operation using browser: ${operation.id}`);

      // TODO add timeout

      const result = await this.#confirm.signOperation(operation.url);

      this.log(`Operation signed: ${result.confirmed}`);

      if (!result.confirmed) {
        throw new Error('Unable to sign operation');
      }
    } catch (err: unknown) {
      this.log(
        `Failed to sign operation: ${
          err instanceof Error ? err.message : 'Unknown error.'
        }`,
      );

      error = err instanceof Error ? err.message : 'Unknown error.';
    }

    if (error) throw new Error(error);

    return true;
  }

  /**
   * Get active session and keys. If a session is not valid, it will try to get a new one. If that fails, only a key will be returned.
   * @param entityId
   * @param chainId
   * @returns
   */
  private async getActiveSessionAndKeys(entityId: string, chainId: number) {
    let session: Session | null = null;

    const sessionInfo = this.#storage.get(StorageKey.SESSION);

    if (sessionInfo) {
      session = sessionInfo;
    }

    const key = this.getOrCreateSigningKey();

    if (!isSessionValid(session)) {
      const account = privateKeyToAccount(key as `0x${string}`);

      try {
        const result = await this.api.getActiveSession(
          entityId,
          account.address,
          {
            chainId,
          },
        );

        if (result) session = result as unknown as Session;
      } catch (error: unknown) {
        this.log(
          `Failed to get active session: ${
            error instanceof Error ? error.message : 'Unknown error.'
          }`,
        );
      }
    }

    if (isSessionValid(session) && isSessionOwnedBy(session, key)) {
      this.#storage.set(StorageKey.SESSION, session);

      return { session, key };
    }

    this.#storage.remove(StorageKey.SESSION);

    return { session: null, key };
  }

  /**
   * Get or create a signing key
   * @param refresh
   * @returns
   */
  private getOrCreateSigningKey(refresh = false) {
    if (!refresh) {
      const stored = this.#storage.get(StorageKey.SIGNING_KEY);
      if (stored) return stored;
    }

    const key = generatePrivateKey();
    this.#storage.set(StorageKey.SIGNING_KEY, key);

    return key;
  }

  private log(message: string) {
    if (!this.#config.debug) return;

    // biome-ignore lint/suspicious/noConsoleLog: allowed for debugging
    console.log(message);
  }
}
