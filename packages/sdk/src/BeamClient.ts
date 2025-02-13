import { getPlayerAPI } from './lib/api/beam.player-api.generated';
import { BeamConfiguration } from './lib/config';
import { beamIcon } from './lib/icon';
import {
  BeamProvider,
  announceProvider,
  beamProviderInfo,
} from './lib/provider';
import { WindowProvider } from './lib/provider/types';
import { StorageKeys, StorageService } from './lib/storage';
import { assert } from './lib/utils/assert';
import { SessionManager } from './sessionManager';
import { ChainId, ClientConfig } from './types';

export class BeamClient {
  readonly #config: BeamConfiguration;

  readonly #sessionManager: SessionManager;

  readonly api = getPlayerAPI();

  #storage: StorageService<StorageKeys>;

  readonly WINDOW_NS = 'beam';

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

    if (typeof window !== 'undefined') {
      (window as WindowProvider)[this.WINDOW_NS] = { provider };
    }

    return provider;
  }

  /**
   * Opens the confirmation popup loading screen. Useful if your app performs async requests between clicking a button
   * and interacting with the Beam SDK, which can cause browsers like Safari to block the popup. Any further SDK interactions
   * that need the popup will use the same popup window.
   * @param popupWindowSize
   */
  public openPopup(popupWindowSize?: {
    width: number;
    height: number;
  }) {
    this.#sessionManager.openPopup(popupWindowSize);
  }

  /**
   * Verifies the ownership of an address
   * @param address
   * @param ownerAddress
   * @returns Promise<boolean>
   */
  public verifyOwnership(address: string, ownerAddress: string) {
    const chainId = this.#config.chainId;
    assert(chainId, 'Chain ID is not set');

    return this.#sessionManager.verifyOwnership(address, ownerAddress, chainId);
  }

  /**
   * Get the active session. If there is no active session, it will throw an error.
   * @param entityId
   * @throws Error
   * @returns Promise<Session>
   */
  public async getActiveSession(entityId: string) {
    const chainId = this.#config.chainId;
    assert(chainId, 'Chain ID is not set');

    return this.#sessionManager.getActiveSession(entityId, chainId);
  }

  /**
   * Create a new session. If there is an active session, it will throw an error.
   * @param entityId
   * @throws Error
   * @returns Promise<boolean>
   */
  public async createSession(entityId: string) {
    const chainId = this.#config.chainId;
    assert(chainId, 'Chain ID is not set');

    return this.#sessionManager.createSession(entityId, chainId);
  }

  /**
   * Revokes a session. If there is no active session, it will throw an error.
   * @param entityId
   * @throws Error
   * @returns Promise<boolean>
   */
  public async revokeSession(entityId: string) {
    const chainId = this.#config.chainId;
    assert(chainId, 'Chain ID is not set');

    return this.#sessionManager.revokeSession(entityId, chainId);
  }

  /**
   * Clear the current session from storage. If the session should be revoked, use the revokeSession method instead.
   */
  public async clearSession() {
    this.#sessionManager.clearSession();
  }

  /**
   * Connect a user to the game
   * @param entityId
   * @throws Error
   * @returns Promise<boolean>
   */
  public async connectUserToGame(entityId: string) {
    const chainId = this.#config.chainId;
    assert(chainId, 'Chain ID is not set');

    return this.#sessionManager.connectUserToGame(entityId, chainId);
  }

  /**
   * Sign an operation by its id
   * @param entityId
   * @param operationId
   * @param chainId
   * @throws Error
   * @returns Promise<PlayerOperationResponse>
   */
  public async signOperation(
    entityId: string,
    operationId: string,
    useBrowserFallback = false,
  ) {
    const chainId = this.#config.chainId;
    assert(chainId, 'Chain ID is not set');

    return this.#sessionManager.signOperation(
      entityId,
      operationId,
      chainId,
      useBrowserFallback,
    );
  }

  /**
   * Base64 encoded SVG Beam logo
   */
  static Icon = beamIcon;
}
