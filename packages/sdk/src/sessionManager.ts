import { Hex, hashMessage, serializeSignature, verifyMessage } from 'viem';
import { generatePrivateKey, privateKeyToAccount, sign } from 'viem/accounts';
import { getPlayerAPI } from './lib/api/beam.player-api.generated';
import { getConnectionAPI } from './lib/api/beam.connection-api.generated';
import {
  CommonOperationResponse,
  CommonOperationResponseStatus,
  ConfirmOperationRequestStatus,
  ConfirmOperationRequestTransactionsItem,
  GenerateSessionRequestResponse,
} from './lib/api/beam.player-api.types.generated';
import { BeamConfiguration } from './lib/config';
import { ConfirmationScreen } from './lib/confirmation';
import { StorageKey, StorageKeys, StorageService } from './lib/storage';
import { Session } from './types';
import { isSessionOwnedBy, isSessionValid } from './utils';
import {
  CreateOperationInputOperationProcessing,
  CreateOperationInputTransactionsItemType,
  CreateTransactionInputInteractionsItem,
} from './lib/api/beam.connection-api.types.generated';

export type SessionManagerInput = {
  config: BeamConfiguration;
  storage: StorageService<StorageKeys>;
};

export class SessionManager {
  readonly #config: BeamConfiguration;

  readonly #confirm: ConfirmationScreen;

  readonly #storage: StorageService<StorageKeys>;

  readonly #connectionApi = getConnectionAPI();

  readonly api = getPlayerAPI();

  constructor({ config, storage }: SessionManagerInput) {
    this.#config = config;
    this.#storage = storage;

    this.#confirm = new ConfirmationScreen(this.#config);
  }

  /**
   * Acquire the users address by connecting to their wallet
   * @param chainId
   * @param message
   * @returns
   */
  async connect(chainId: number, message: string) {
    let address: string | null = null;

    const fromStorage = this.#storage.get(StorageKey.ACCOUNT_ADDRESS) ?? {};
    if (fromStorage[chainId]) return { address: fromStorage[chainId] };

    try {
      const connection = await this.#connectionApi.getMessageSignatureUrl({
        chainId,
        message: hashMessage(message) as Hex,
      });

      const result = await this.#confirm.requestConnection(connection.url);

      const verified = await verifyMessage({
        message,
        signature: result.signature as Hex,
        address: result.ownerAddress,
      });

      if (!verified) {
        throw new Error('Failed to verify signature');
      }

      if (result.address) {
        address = result.address;

        this.#storage.set(StorageKey.ACCOUNT_ADDRESS, {
          ...fromStorage,
          [chainId]: address,
        });
      }
    } catch (error: unknown) {
      this.log(
        `Failed to get address: ${
          error instanceof Error ? error.message : 'Unknown error.'
        }`,
      );
    }

    if (!address) {
      throw new Error('Failed to get address');
    }

    return { address };
  }

  /**
   * Verifies if an address is owned by an ownerAddress
   * @param address
   * @param ownerAddress
   * @param chainId
   * @returns
   */
  async verifyOwnership(
    address: string,
    ownerAddress: string,
    chainId: number,
  ) {
    return this.#connectionApi.verifyOwnership({
      accountAddress: address,
      ownerAddress,
      chainId,
    });
  }

  /**
   * Get the active session. If there is no active session, it will throw an error.
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Session
   */
  async getActiveSession(entityId: string, chainId: number) {
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
  async createSession(entityId: string, chainId: number) {
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
      const account = privateKeyToAccount(key);

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
  clearSession() {
    this.#storage.clear();
  }

  /**
   * Sign a transaction
   * @param message
   * @returns string
   */
  async signTransaction(
    chainId: number,
    accountAddress: string,
    // TODO type
    data: unknown,
  ) {
    let operation: CommonOperationResponse | null = null;

    try {
      this.log('Requesting signature');

      const type =
        typeof data === 'string'
          ? CreateOperationInputTransactionsItemType.OpenfortTransaction
          : CreateOperationInputTransactionsItemType.OpenfortReservoirOrder;

      const result = await this.#connectionApi.createOperation({
        accountAddress,
        chainId,
        transactions: [
          {
            data,
            type,
          },
        ],
        operationProcessing: CreateOperationInputOperationProcessing.SignOnly,
      });

      if (result) operation = result;
    } catch (err: unknown) {
      this.log(
        `Failed to sign transaction: ${
          err instanceof Error ? err.message : 'Unknown error.'
        }`,
      );
    }

    if (!operation) {
      this.log('Failed to get operation');

      throw new Error('Failed to get operation');
    }

    operation = await this.signOperationUsingBrowser(operation);

    if (operation.status !== CommonOperationResponseStatus.Signed) {
      throw new Error(`Operation failed with status: ${operation.status}`);
    }

    const [transaction] = operation.transactions;

    if (!transaction.signature) {
      throw new Error('No signature found in transaction');
    }

    return transaction.signature;
  }

  /**
   * Execute a transaction
   * @param accountAddress
   * @param chainId
   * @param interaction
   * @returns
   */
  async sendTransaction(
    accountAddress: string,
    chainId: number,
    interaction: CreateTransactionInputInteractionsItem,
  ) {
    let operation: CommonOperationResponse | null = null;

    try {
      this.log('Sending transaction');

      const result = await this.#connectionApi.createTransactionForAddress({
        accountAddress,
        chainId,
        interactions: [interaction],
      });

      if (result) operation = result;
    } catch (err: unknown) {
      this.log(
        `Failed to execute step: ${
          err instanceof Error ? err.message : 'Unknown error.'
        }`,
      );
    }

    if (!operation) {
      this.log('Failed to get operation');

      throw new Error('Failed to get operation');
    }

    return this.signOperationUsingBrowser(operation);
  }

  /**
   * Sign an operation by its id
   * @param entityId
   * @param operationId
   * @param chainId
   * @throws Error
   * @returns boolean
   */
  async signOperation(
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
    privateKey: Hex,
  ) {
    if (!operation.transactions.length) {
      throw new Error('No transactions found in operation');
    }

    let error: string | null = null;

    const transactions: ConfirmOperationRequestTransactionsItem[] = [];

    for (const tx of operation.transactions) {
      try {
        const signature = serializeSignature(
          await sign({
            hash: tx.hash as Hex,
            privateKey,
          }),
        );

        transactions.push({
          id: tx.id,
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

    return this.api.getOperation(operation.id);
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

    return this.api.getOperation(operation.id);
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
      const account = privateKeyToAccount(key);

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
