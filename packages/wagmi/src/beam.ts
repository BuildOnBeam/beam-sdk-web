import type { BeamClient, BeamConfiguration, BeamProvider } from '@onbeam/sdk';
import {
  Address,
  ProviderConnectInfo,
  ResourceUnavailableRpcError,
  RpcError,
  SwitchChainError,
  UserRejectedRequestError,
  getAddress,
  withRetry,
} from 'viem';
import {
  ChainNotConfiguredError,
  Connector,
  ProviderNotFoundError,
  createConnector,
} from 'wagmi';

export type BeamParameters = {
  config?: BeamConfiguration;
  announceProvider?: boolean;
};

export function beam(parameters: BeamParameters = {}) {
  type Provider = Awaited<ReturnType<BeamClient['connectProvider']>>;

  type Properties = {
    onConnect(connectInfo: ProviderConnectInfo): void;
  };
  type StorageItem = {
    [_ in 'beam.connected' | `${string}.disconnected`]: true;
  };

  const announceProvider = parameters.announceProvider ?? true;

  const beamConfig = parameters.config;

  const shimDisconnect = true;

  let _accountsRequested = false;

  let provider: BeamProvider;

  let accountsChanged: Connector['onAccountsChanged'] | undefined;
  let chainChanged: Connector['onChainChanged'] | undefined;
  let connect: Connector['onConnect'] | undefined;
  let disconnect: Connector['onDisconnect'] | undefined;

  return createConnector<Provider, Properties, StorageItem>((config) => ({
    id: 'beam',
    name: 'Beam',
    type: 'beam',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgNEMwIDEuNzkwODYgMS43OTA4NiAwIDQgMEgyNkMyOC4yMDkxIDAgMzAgMS43OTA4NiAzMCA0VjcuNUgwVjRaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMV82NCkiLz4KPHBhdGggZD0iTTAgMjIuNUgzMFYyNkMzMCAyOC4yMDkxIDI4LjIwOTEgMzAgMjYgMzBINEMxLjc5MDg2IDMwIDAgMjguMjA5MSAwIDI2VjIyLjVaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMV82NCkiLz4KPHBhdGggZD0iTTAgNy41SDMwVjE1SDBWNy41WiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzFfNjQpIi8+CjxwYXRoIGQ9Ik0wIDcuNUgzMFYxNUgwVjcuNVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8xXzY0KSIvPgo8cGF0aCBkPSJNMCAxNUgzMFYyMi41SDBWMTVaIiBmaWxsPSJ1cmwoI3BhaW50NF9saW5lYXJfMV82NCkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xXzY0IiB4MT0iMTUuMTA3NyIgeTE9IjMuOTM3NSIgeDI9IjE1LjEwNjUiIHkyPSIxMi4zMDQ3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNCQkRCRkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjMyODEyNSIgc3RvcC1jb2xvcj0iIzEzOUVERCIvPgo8c3RvcCBvZmZzZXQ9IjAuNTk4OTU4IiBzdG9wLWNvbG9yPSIjQjlGN0VBIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8xXzY0IiB4MT0iMTMuNzEwMSIgeTE9IjI2LjQzNzUiIHgyPSIxMy43MDkiIHkyPSIzNC44MDQ3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNCQkZGQ0EiLz4KPHN0b3Agb2Zmc2V0PSIwLjMyODEyNSIgc3RvcC1jb2xvcj0iIzQ4REQxMyIvPgo8c3RvcCBvZmZzZXQ9IjAuNTk4OTU4IiBzdG9wLWNvbG9yPSIjMDA4ODA1Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8xXzY0IiB4MT0iMTMuNjgzNyIgeTE9IjguNDI1OTEiIHgyPSIxMy42ODI4IiB5Mj0iMTUuMzAxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjZBOUEiLz4KPHN0b3Agb2Zmc2V0PSIwLjUyOTgxOSIgc3RvcC1jb2xvcj0iI0ZGNTU0NCIvPgo8c3RvcCBvZmZzZXQ9IjAuOTU1NTQ1IiBzdG9wLWNvbG9yPSIjRTYzRTMzIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xXzY0IiB4MT0iMTMuMzcyOCIgeTE9IjExLjQzNzUiIHgyPSIxMy4zNzE4IiB5Mj0iMTkuODA0NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkY2QjZCIi8+CjxzdG9wIG9mZnNldD0iMC4zMjgxMjUiIHN0b3AtY29sb3I9IiNGRTE0MTQiLz4KPHN0b3Agb2Zmc2V0PSIwLjU5ODk1OCIgc3RvcC1jb2xvcj0iIzhFMDkwMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50NF9saW5lYXJfMV82NCIgeDE9IjEzLjg5ODYiIHkxPSIxOC45Mzc1IiB4Mj0iMTMuODk3NSIgeTI9IjI3LjMwNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0YxRTg2OSIvPgo8c3RvcCBvZmZzZXQ9IjAuMzI4MTI1IiBzdG9wLWNvbG9yPSIjRkVBNTE0Ii8+CjxzdG9wIG9mZnNldD0iMC41OTg5NTgiIHN0b3AtY29sb3I9IiNGRjQ1MzkiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',

    async setup() {
      const provider = await this.getProvider();

      if (provider) {
        if (!connect) {
          connect = this.onConnect.bind(this);
          provider.on('connect', connect);
        }

        // We shouldn't need to listen for `'accountsChanged'` here since the `'connect'` event should suffice (and wallet shouldn't be connected yet).
        // Some wallets, like MetaMask, do not implement the `'connect'` event and overload `'accountsChanged'` instead.
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on('accountsChanged', accountsChanged);
        }
      }
    },

    async connect({ chainId, isReconnecting } = {}) {
      const provider = await this.getProvider();
      if (!provider) throw new ProviderNotFoundError();

      let accounts: readonly Address[] = [];
      if (isReconnecting) accounts = await this.getAccounts().catch(() => []);

      try {
        if (!accounts?.length && !isReconnecting) {
          const requestedAccounts = await this.getAccounts();
          accounts = requestedAccounts.map((x) => getAddress(x));
        }

        // Switch to chain if provided
        let currentChainId = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId }).catch((error) => {
            if (error.code === UserRejectedRequestError.code) throw error;
            return { id: currentChainId };
          });
          currentChainId = chain?.id ?? currentChainId;
        }

        // Remove disconnected shim if it exists
        if (shimDisconnect)
          await config.storage?.removeItem(`${this.id}.disconnected`);

        // Add connected shim
        await config.storage?.setItem('beam.connected', true);

        return { accounts, chainId: currentChainId };
      } catch (err) {
        const error = err as RpcError;
        if (error.code === UserRejectedRequestError.code)
          throw new UserRejectedRequestError(error);
        if (error.code === ResourceUnavailableRpcError.code)
          throw new ResourceUnavailableRpcError(error);
        throw error;
      }
    },

    async disconnect() {
      const provider = await this.getProvider();
      if (!provider) throw new ProviderNotFoundError();

      provider.disconnect();

      // Manage EIP-1193 event listeners
      if (chainChanged) {
        provider.removeListener('chainChanged', chainChanged);
        chainChanged = undefined;
      }
      if (disconnect) {
        provider.removeListener('disconnect', disconnect);
        disconnect = undefined;
      }
      if (!connect) {
        connect = this.onConnect.bind(this);
        provider.on('connect', connect);
      }

      // Reset the accounts requested flag to enable reconnection
      _accountsRequested = false;

      // Add shim signalling connector is disconnected
      if (shimDisconnect) {
        await config.storage?.setItem(`${this.id}.disconnected`, true);
      }

      await config.storage?.removeItem('beam.connected');
    },

    async getAccounts() {
      const provider = await this.getProvider();
      if (!provider) throw new ProviderNotFoundError();

      const method = _accountsRequested
        ? 'eth_accounts'
        : 'eth_requestAccounts';
      const accounts = await provider.request({
        method,
      });

      _accountsRequested = true;

      return accounts;
    },

    async getChainId() {
      const provider = await this.getProvider();
      if (!provider) throw new ProviderNotFoundError();
      const hexChainId = await provider.request({ method: 'eth_chainId' });
      return Number(hexChainId);
    },

    async getProvider() {
      if (!provider) {
        if (!beamConfig) throw new Error('Beam configuration is required');

        const { BeamClient } = await import('@onbeam/sdk');
        const client = new BeamClient(beamConfig);

        provider = client.connectProvider({ announceProvider });
      }

      return Promise.resolve(provider);
    },

    async isAuthorized() {
      try {
        const isDisconnected =
          shimDisconnect &&
          // If shim exists in storage, connector is disconnected
          (await config.storage?.getItem(`${this.id}.disconnected`));
        if (isDisconnected) return false;

        const connected = await config.storage?.getItem('beam.connected');
        if (!connected) return false;

        const provider = await this.getProvider();
        if (!provider) throw new ProviderNotFoundError();

        const accounts = await withRetry(() => this.getAccounts());
        return !!accounts.length;
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      if (!provider) throw new ProviderNotFoundError();

      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      return chain;
    },

    async onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },

    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },

    async onConnect(connectInfo) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) return;

      const chainId = Number(connectInfo.chainId);
      config.emitter.emit('connect', { accounts, chainId });

      // Manage EIP-1193 event listeners
      const provider = await this.getProvider();
      if (provider) {
        if (connect) {
          provider.removeListener('connect', connect);
          connect = undefined;
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on('accountsChanged', accountsChanged);
        }
        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this);
          provider.on('chainChanged', chainChanged);
        }
        if (!disconnect) {
          disconnect = this.onDisconnect.bind(this);
          provider.on('disconnect', disconnect);
        }
      }
    },

    async onDisconnect() {
      const provider = await this.getProvider();

      // No need to remove `${this.id}.disconnected` from storage because `onDisconnect` is typically
      // only called when the wallet is disconnected through the wallet's interface, meaning the wallet
      // actually disconnected and we don't need to simulate it.
      config.emitter.emit('disconnect');

      // Manage EIP-1193 event listeners
      if (provider) {
        if (chainChanged) {
          provider.removeListener('chainChanged', chainChanged);
          chainChanged = undefined;
        }
        if (disconnect) {
          provider.removeListener('disconnect', disconnect);
          disconnect = undefined;
        }
        if (!connect) {
          connect = this.onConnect.bind(this);
          provider.on('connect', connect);
        }
      }
    },
  }));
}
