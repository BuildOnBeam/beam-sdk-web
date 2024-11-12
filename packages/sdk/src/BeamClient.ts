import { AXIOS_INSTANCE } from './lib/api/beam-axios-client';
import { getPlayerAPI } from './lib/api/beam.player-api.generated';
import { BeamConfiguration } from './lib/config';
import { beamIcon } from './lib/icon';
import {
  BeamProvider,
  announceProvider,
  beamProviderInfo,
} from './lib/provider';
import { StorageKeys, StorageService } from './lib/storage';
import { SessionManager } from './sessionManager';
import { ChainId, ClientConfig } from './types';

export class BeamClient {
  readonly #config: BeamConfiguration;

  readonly #sessionManager: SessionManager;

  readonly api = getPlayerAPI();

  #storage: StorageService<StorageKeys>;

  constructor(config: ClientConfig) {
    this.#config = new BeamConfiguration(config);

    this.#storage = new StorageService<StorageKeys>(
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : // TODO - implement a fallback for node
          {
            getItem: (_key: string) => null,
            setItem: (_key: string, _value: string) => {},
            removeItem: (_key: string) => {},
            key: (_index: number) => null,
            clear: () => {},
            length: 0,
          },
    );

    this.#sessionManager = new SessionManager({
      config: this.#config,
      storage: this.#storage,
    });

    this.#setAxiosInterceptors();
  }

  /**
   * Override the default storage. The storage should implement the Storage interface, and be compliant with
   * both browser and node environments.
   * @param storage
   */
  public setStorage(storage: Storage) {
    this.#storage = new StorageService<StorageKeys>(storage);
  }

  /**
   * Get the current chain configuration
   */
  public get chain() {
    return this.#config.getChainConfig();
  }

  /**
   * Set the chainId for the current client
   * @param chainId
   */
  public switchChain(chainId: ChainId) {
    if (this.#config.chainId === chainId) return;

    this.#config.setChainId(chainId);

    this.#setAxiosInterceptors();
  }

  /**
   * Instantiate a new provider
   * @param options
   * @returns EIP6963Provider
   */
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
   * Verifies the ownership of an address
   * @param address
   * @param ownerAddress
   * @param chainId
   * @returns
   */
  public verifyOwnership(
    address: string,
    ownerAddress: string,
    chainId: number,
  ) {
    return this.#sessionManager.verifyOwnership(address, ownerAddress, chainId);
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

  /**
   * Set the axios interceptors for the current chain
   */
  #setAxiosInterceptors() {
    if (!this.#config.chainId) return;

    AXIOS_INSTANCE.interceptors.request.use((config) => {
      config.baseURL = this.#config.getChainConfig().apiUrl;
      config.headers.set(
        'x-api-key',
        this.#config.getChainConfig().publishableKey,
      );
      return config;
    });
  }

  /**
   * Base64 encoded SVG Beam logo
   */
  static Icon = beamIcon;
}
