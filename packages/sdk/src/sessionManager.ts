import { Hex, hashMessage, serializeSignature, verifyMessage } from 'viem';
import { generatePrivateKey, privateKeyToAccount, sign } from 'viem/accounts';
import { getConnectionAPI } from './lib/api/beam.connection-api.generated';
import { CreateTransactionInputInteractionsItem } from './lib/api/beam.connection-api.types.generated';
import { getPlayerAPI } from './lib/api/beam.player-api.generated';
import {
  ConfirmOperationRequestActionsItem,
  ConfirmOperationRequestStatus,
  CreateConnectionRequestResponse,
  GenerateSessionRequestResponse,
  PlayerOperationResponse,
  PlayerOperationResponseStatus,
} from './lib/api/beam.player-api.types.generated';
import { BeamConfiguration } from './lib/config';
import { ConfirmationScreen } from './lib/confirmation';
import { StorageKey, StorageKeys, StorageService } from './lib/storage';
import { Session } from './types';
import { isSessionOwnedBy, isSessionValid } from './utils';

export type SessionManagerInput = {
  config: BeamConfiguration;
  storage: StorageService<StorageKeys>;
};

export class SessionManager {
  #config: BeamConfiguration;
  #confirm: ConfirmationScreen;

  readonly #storage: StorageService<StorageKeys>;

  readonly #connectionApi = getConnectionAPI();

  readonly api = getPlayerAPI();

  constructor({ config, storage }: SessionManagerInput) {
    this.#config = config;
    this.#storage = storage;

    this.#confirm = new ConfirmationScreen(this.#config);
  }

  /**
   * Update the configuration
   * @param config
   */
  setConfig(config: BeamConfiguration) {
    this.#config = config;
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

    const stored = this.getAddress(chainId);
    if (stored) return { address: stored };

    return this.withConfirmationScreen()(async () => {
      try {
        const connection = await this.#connectionApi.getMessageSignatureUrl({
          chainId,
          message: hashMessage(message) as Hex,
          authProvider: this.#config.authProvider,
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

          this.setAddress(chainId, address);
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
    });
  }

  /**
   * Returns a stored address for a chainId
   * @param chainId
   * @returns string | null
   */
  getAddress(chainId: number) {
    const stored = this.#storage.get(StorageKey.ACCOUNT_ADDRESS) ?? {};
    return stored[chainId] || null;
  }

  /**
   * Sets an address for a chainId
   * @param chainId
   * @param address
   */
  setAddress(chainId: number, address: string) {
    const stored = this.#storage.get(StorageKey.ACCOUNT_ADDRESS) ?? {};
    this.#storage.set(StorageKey.ACCOUNT_ADDRESS, {
      ...stored,
      [chainId]: address,
    });
  }

  /**
   * Verifies if an address is owned by an ownerAddress
   * @param address
   * @param ownerAddress
   * @param chainId
   * @returns Promise<boolean>
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
   * @returns Promise<Session>
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
   * @returns Promise<Session>
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
        authProvider: this.#config.authProvider,
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
   * Revoke the current session
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Promise<boolean>
   */
  async revokeSession(entityId: string, chainId: number) {
    let { session, key } = await this.getActiveSessionAndKeys(
      entityId,
      chainId,
    );

    if (!session) {
      this.log('No active session found, ending early');

      throw new Error('No active session found to revoke');
    }

    this.log('Revoking session');

    key = this.getOrCreateSigningKey(true);

    let operation: PlayerOperationResponse | null = null;
    let error: string | null = null;

    try {
      const account = privateKeyToAccount(key);

      const result = await this.api.revokeSession(entityId, {
        chainId,
        address: account.address,
        authProvider: this.#config.authProvider,
      });

      if (result) operation = result;
    } catch (error: unknown) {
      this.log(
        `Failed to  revoke session: ${
          error instanceof Error ? error.message : 'Unknown error.'
        }`,
      );
    }

    if (!operation) {
      this.log('Failed to get operation to revoke session');

      throw new Error('Failed to get operation to revoke session');
    }

    try {
      this.log(`Signing operation using browser: ${operation.id}`);

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

    operation = await this.api.getOperation(operation.id);

    if (operation.status !== PlayerOperationResponseStatus.Executed) {
      throw new Error(`Operation failed with status: ${operation.status}`);
    }

    this.clearSession();

    return true;
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
   * Connect a user to the game by creating and monitoring a connection request
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Promise<boolean>
   */
  async connectUserToGame(entityId: string, chainId: number) {
    this.log('Connecting user to game');

    let connectionRequest: CreateConnectionRequestResponse | null = null;

    try {
      const result = await this.api.createConnectionRequest({
        entityId,
        chainId,
        authProvider: this.#config.authProvider,
      });

      connectionRequest = result;
    } catch (error) {
      this.log(
        `Failed to create connection request: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw error;
    }

    this.log(`Opening connection request URL: ${connectionRequest.url}`);

    return this.withConfirmationScreen()(async () => {
      try {
        const result = await this.#confirm.requestConnection(
          connectionRequest.url,
        );

        if (!result) {
          throw new Error('Connection request failed');
        }

        this.log('Connection request successful');

        return true;
      } catch (error) {
        this.log(
          `Failed to complete connection request: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
        throw error;
      }
    });
  }

  /**
   * Sign a message or typed data
   * @param chainId
   * @param accountAddress account abstraction getAddress
   * @param data message or typed data
   * @throws Error
   * @returns Promise<string> (signature)
   */
  async signMessageOrData(chainId: number, accountAddress: string, data: any) {
    let operation: PlayerOperationResponse | null = null;
    let error: string | null = null;

    return this.withConfirmationScreen()(async () => {
      try {
        this.log('Requesting signature');

        const result = await this.#connectionApi.createOperation({
          accountAddress,
          chainId,
          actions: [
            {
              type: 'Sign',
              signature: {
                data: data,
                type: typeof data === 'string' ? 'Message' : 'TypedData',
              },
            },
          ],
          authProvider: this.#config.authProvider,
        });

        if (result) operation = result;
      } catch (err: unknown) {
        this.log(
          `Failed to provide signature: ${
            err instanceof Error ? err.message : 'Unknown error.'
          }`,
        );
      }

      if (!operation) {
        this.log('Failed to get operation');

        throw new Error('Failed to get operation');
      }

      try {
        this.log(`Signing operation using browser: ${operation.id}`);

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

      operation = await this.api.getOperation(operation.id);

      if (operation.status !== PlayerOperationResponseStatus.Executed) {
        throw new Error(`Operation failed with status: ${operation.status}`);
      }

      const [{ signature: signatureRequest }] = operation.actions;

      if (!signatureRequest || !signatureRequest.signature) {
        throw new Error('No signature found in transaction');
      }

      return signatureRequest.signature;
    });
  }

  /**
   * Execute a transaction
   * @param accountAddress
   * @param chainId
   * @param interaction
   * @throws Error
   * @returns Promise<PlayerOperationResponse>
   */
  async sendTransaction(
    accountAddress: string,
    chainId: number,
    sponsor: boolean,
    interaction: CreateTransactionInputInteractionsItem,
  ) {
    let operation: PlayerOperationResponse | null = null;
    let error: string | null = null;

    return this.withConfirmationScreen()(async () => {
      try {
        this.log('Sending transaction');

        const result = await this.#connectionApi.createTransactionForAddress({
          accountAddress,
          chainId,
          sponsor,
          interactions: [interaction],
          authProvider: this.#config.authProvider,
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

      try {
        this.log(`Signing operation using browser: ${operation.id}`);

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
    });
  }

  /**
   * Sign an operation by its id
   * @param entityId
   * @param operationId
   * @param chainId
   * @param useBrowserFallback
   * @throws Error
   * @returns Promise<PlayerOperationResponse>
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

    let operation: PlayerOperationResponse | null = null;

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
      return this.signOperationUsingSession(operation, key);
    }

    if (useBrowserFallback) {
      return this.signOperationUsingBrowser(operation);
    }

    throw new Error(
      'Unable to sign operation, no valid session or key found and no browser fallback enabled.',
    );
  }

  /**
   * Sign an operation using a session
   * @param operation
   * @param privateKey
   * @throws Error
   * @returns Promise<PlayerOperationResponse>
   */
  private async signOperationUsingSession(
    operation: PlayerOperationResponse,
    privateKey: Hex,
  ) {
    if (!operation.actions.length) {
      throw new Error('No actions found in operation');
    }

    let error: string | null = null;

    const actions: ConfirmOperationRequestActionsItem[] = [];

    for (const action of operation.actions) {
      /** if there's nothing to sign, skip to the next */
      if (!action.signature) continue;
      try {
        const signature = serializeSignature(
          await sign({
            hash: action.signature.hash as Hex,
            privateKey,
          }),
        );
        actions.push({
          id: action.id,
          signature,
        });
      } catch (err: unknown) {
        this.log(
          `Failed to provide signature: ${
            err instanceof Error ? err.message : 'Unknown error.'
          }`,
        );

        error = err instanceof Error ? err.message : 'Unknown error.';
      }
    }

    if (error) throw new Error(error);

    try {
      const result = await this.api.processOperation(operation.id, {
        status: ConfirmOperationRequestStatus.Pending,
        actions,
      });

      const hasFailed =
        result.status !== PlayerOperationResponseStatus.Executed &&
        result.status !== PlayerOperationResponseStatus.Signed &&
        result.status !== PlayerOperationResponseStatus.Pending;

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

  /**
   * Sign an operation using the browser
   * @param operation
   * @throws Error
   * @returns Promise<PlayerOperationResponse>
   */
  private async signOperationUsingBrowser(operation: PlayerOperationResponse) {
    let error: string | null = null;

    return this.withConfirmationScreen()(async () => {
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
    });
  }

  /**
   * Get active session and keys. If a session is not valid, it will try to get a new one. If that fails, only a key will be returned.
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Promise<{ session: Session | null, key: Hex }>
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
   * @throws Error
   * @returns Hex
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

  /**
   * Open confirmation screen and close it automatically if the
   * underlying task fails.
   */
  public withConfirmationScreen(popupWindowSize?: {
    width: number;
    height: number;
  }) {
    return <T>(task: () => Promise<T>): Promise<T> =>
      this.withConfirmationScreenTask(popupWindowSize)(task)();
  }

  /**
   * Async function that wraps a task with a confirmation screen, while
   * also initially opening the confirmation loading screen.
   * @param popupWindowSize
   * @returns Promise<T>
   */
  public withConfirmationScreenTask(popupWindowSize?: {
    width: number;
    height: number;
  }) {
    return <T>(task: () => Promise<T>): (() => Promise<T>) =>
      async () => {
        this.#confirm.loading(popupWindowSize);

        try {
          return await task();
        } catch (err) {
          if (!this.#config.debug) {
            this.#confirm.closeWindow();
          }
          throw err;
        }
      };
  }

  /**
   * Opens the confirmation loading screen
   * @param popupWindowSize
   */
  public openPopup(popupWindowSize?: {
    width: number;
    height: number;
  }) {
    this.#confirm.loading(popupWindowSize);
  }

  /**
   * Log a message if debug is enabled
   * @param message
   */
  private log(message: string) {
    if (!this.#config.debug) return;

    // biome-ignore lint/suspicious/noConsoleLog: allowed for debugging
    console.log(message);
  }
}
