import { getBeamSelfCustodyAPI } from 'lib/api/beam.api.generated';
import { BeamConfiguration } from 'lib/config';
import { ConfirmationScreen } from 'lib/confirmation';
import { StorageKey, StorageKeys, StorageService } from 'lib/storage';
import { ClientConfig, Session } from 'types';
import { isSessionOwnedBy, isSessionValid } from 'utils';
import { generatePrivateKey } from 'viem/accounts';

export class BeamClient {
  readonly #api = getBeamSelfCustodyAPI();

  readonly #config: BeamConfiguration;

  readonly #confirm: ConfirmationScreen;

  #storage = new StorageService<StorageKeys>(window.sessionStorage);

  constructor(config: ClientConfig) {
    this.#config = new BeamConfiguration(config);

    this.#confirm = new ConfirmationScreen(this.#config);
  }

  public setStorage(storage: Storage) {
    this.#storage = new StorageService<StorageKeys>(storage);
  }

  public async getActiveSession(entityId: string, chainId: number) {
    const { session } = await this.getActiveSessionAndKeys(entityId, chainId);

    if (!session) {
      this.log('Unable to get active session');

      throw new Error('No active session found');
    }

    this.log('Got active session');

    return session;
  }

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

    let sessionRequest;

    try {
      sessionRequest = await this.#api.createSessionRequest(
        entityId,
        {
          chainId,
          address: key,
        },
        this.getApiRequestConfig(),
      );
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

    let error;

    try {
      this.log(`Confirming session request: ${sessionRequest.id}`);

      // TODO add timeout

      const result = await this.#confirm.requestSession(sessionRequest.url);

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

  public async signOperation(_entityId: string, _operationId: string) {
    // get or create session
  }

  private async signOperationUsingSession() {}
  private async signOperationUsingBrowser() {}

  private async getActiveSessionAndKeys(entityId: string, chainId: number) {
    let session = null;

    const sessionInfo = this.#storage.get(StorageKey.SESSION);

    if (sessionInfo) {
      session = sessionInfo;
    }

    const key = this.getOrCreateSigningKey();

    if (!isSessionValid(session)) {
      const result = await this.#api.getActiveSession(
        entityId,
        key, // NOTE this is the private key, is this correct?
        {
          chainId,
        },
        this.getApiRequestConfig(),
      );

      if (result) session = result as unknown as Session;
    }

    if (isSessionValid(session) && isSessionOwnedBy(session, key)) {
      this.#storage.set(StorageKey.SESSION, session);

      return { session, key };
    }

    this.#storage.remove(StorageKey.SESSION);

    return { session: null, key };
  }

  private getOrCreateSigningKey(refresh = false) {
    if (!refresh) {
      const stored = this.#storage.get(StorageKey.SIGNING_KEY);
      if (stored) return stored;
    }

    const key = generatePrivateKey();
    this.#storage.set(StorageKey.SIGNING_KEY, key);

    return key;
  }

  private getApiRequestConfig() {
    if (!this.#config.publishableKey) {
      throw new Error('Publishable key is not set');
    }

    return {
      baseURL: this.#config.apiUrl,
      headers: {
        'x-api-key': this.#config.publishableKey,
      },
    };
  }

  private log(_message: string) {
    if (!this.#config.debug) return;
  }
}
