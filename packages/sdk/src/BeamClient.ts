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
import { getPlayerAPI } from './lib/api/beam.player-api.generated';

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

    AXIOS_INSTANCE.interceptors.request.use((config) => {
      config.baseURL = this.#config.apiUrl;
      config.headers.set('x-api-key', this.#config.publishableKey);
      return config;
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
   * Base64 encoded SVG Beam logo
   */
  static Icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgNEMwIDEuNzkwODYgMS43OTA4NiAwIDQgMEgyNkMyOC4yMDkxIDAgMzAgMS43OTA4NiAzMCA0VjcuNUgwVjRaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMV82NCkiLz4KPHBhdGggZD0iTTAgMjIuNUgzMFYyNkMzMCAyOC4yMDkxIDI4LjIwOTEgMzAgMjYgMzBINEMxLjc5MDg2IDMwIDAgMjguMjA5MSAwIDI2VjIyLjVaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMV82NCkiLz4KPHBhdGggZD0iTTAgNy41SDMwVjE1SDBWNy41WiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzFfNjQpIi8+CjxwYXRoIGQ9Ik0wIDcuNUgzMFYxNUgwVjcuNVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8xXzY0KSIvPgo8cGF0aCBkPSJNMCAxNUgzMFYyMi41SDBWMTVaIiBmaWxsPSJ1cmwoI3BhaW50NF9saW5lYXJfMV82NCkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xXzY0IiB4MT0iMTUuMTA3NyIgeTE9IjMuOTM3NSIgeDI9IjE1LjEwNjUiIHkyPSIxMi4zMDQ3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNCQkRCRkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjMyODEyNSIgc3RvcC1jb2xvcj0iIzEzOUVERCIvPgo8c3RvcCBvZmZzZXQ9IjAuNTk4OTU4IiBzdG9wLWNvbG9yPSIjQjlGN0VBIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8xXzY0IiB4MT0iMTMuNzEwMSIgeTE9IjI2LjQzNzUiIHgyPSIxMy43MDkiIHkyPSIzNC44MDQ3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNCQkZGQ0EiLz4KPHN0b3Agb2Zmc2V0PSIwLjMyODEyNSIgc3RvcC1jb2xvcj0iIzQ4REQxMyIvPgo8c3RvcCBvZmZzZXQ9IjAuNTk4OTU4IiBzdG9wLWNvbG9yPSIjMDA4ODA1Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8xXzY0IiB4MT0iMTMuNjgzNyIgeTE9IjguNDI1OTEiIHgyPSIxMy42ODI4IiB5Mj0iMTUuMzAxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjZBOUEiLz4KPHN0b3Agb2Zmc2V0PSIwLjUyOTgxOSIgc3RvcC1jb2xvcj0iI0ZGNTU0NCIvPgo8c3RvcCBvZmZzZXQ9IjAuOTU1NTQ1IiBzdG9wLWNvbG9yPSIjRTYzRTMzIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xXzY0IiB4MT0iMTMuMzcyOCIgeTE9IjExLjQzNzUiIHgyPSIxMy4zNzE4IiB5Mj0iMTkuODA0NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkY2QjZCIi8+CjxzdG9wIG9mZnNldD0iMC4zMjgxMjUiIHN0b3AtY29sb3I9IiNGRTE0MTQiLz4KPHN0b3Agb2Zmc2V0PSIwLjU5ODk1OCIgc3RvcC1jb2xvcj0iIzhFMDkwMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50NF9saW5lYXJfMV82NCIgeDE9IjEzLjg5ODYiIHkxPSIxOC45Mzc1IiB4Mj0iMTMuODk3NSIgeTI9IjI3LjMwNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0YxRTg2OSIvPgo8c3RvcCBvZmZzZXQ9IjAuMzI4MTI1IiBzdG9wLWNvbG9yPSIjRkVBNTE0Ii8+CjxzdG9wIG9mZnNldD0iMC41OTg5NTgiIHN0b3AtY29sb3I9IiNGRjQ1MzkiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
}
