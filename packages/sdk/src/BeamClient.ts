import { AXIOS_INSTANCE } from './lib/api/beam-axios-client';
import { BeamConfiguration } from './lib/config';
import {
  BeamProvider,
  announceProvider,
  beamProviderInfo,
} from './lib/provider';
import { StorageKeys, StorageService } from './lib/storage';
import { SessionManager } from './sessionManager';
import { ClientConfig } from './types';
import { getPlayerAPI } from './lib/api/beam.api.generated';

export class BeamClient {
  readonly #config: BeamConfiguration;

  readonly #sessionManager: SessionManager;

  readonly api = getPlayerAPI();

  #storage = new StorageService<StorageKeys>(window.localStorage);

  constructor(config: ClientConfig) {
    this.#config = new BeamConfiguration(config);

    this.#sessionManager = new SessionManager({
      config: this.#config,
      storage: this.#storage,
    });

    AXIOS_INSTANCE.interceptors.request.use((config) => {
      config.baseURL = this.#config.apiUrl;
      config.headers.set('x-api-key', this.#config.publishableKey);
      return config;
    });
  }

  public setStorage(storage: Storage) {
    this.#storage = new StorageService<StorageKeys>(storage);
  }

  public connectProvider(
    options: {
      announceProvider: boolean;
    } = {
      announceProvider: true,
    },
  ) {
    const provider = new BeamProvider({
      config: this.#config,
      sessionManager: this.#sessionManager,
    });

    if (options?.announceProvider) {
      announceProvider({
        info: beamProviderInfo,
        provider,
      });
    }

    return provider;
  }

  /**
   * Get the active session. If there is no active session, it will throw an error.
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Session
   */
  public async getActiveSession(entityId: string, chainId: number) {
    return this.#sessionManager.getActiveSession(entityId, chainId);
  }

  /**
   * Create a new session. If there is an active session, it will throw an error.
   * @param entityId
   * @param chainId
   * @throws Error
   * @returns Session
   */
  public async createSession(entityId: string, chainId: number) {
    return this.#sessionManager.createSession(entityId, chainId);
  }

  /**
   * Clear the current session
   * @param entityId
   * @param chainId
   */
  public async clearSession() {
    this.#sessionManager.clearSession();
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
    return this.#sessionManager.signOperation(
      entityId,
      operationId,
      chainId,
      useBrowserFallback,
    );
  }
}
