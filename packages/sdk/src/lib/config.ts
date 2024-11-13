import { ClientConfig } from '../types';
import { ChainId } from '../types';

export class BeamConfiguration {
  readonly chains: ClientConfig['chains'];

  #chainId?: ChainId;

  readonly debug?: boolean;

  constructor(config: ClientConfig) {
    if (!config.chains.length) {
      throw new Error('At least one chain should be defined');
    }

    this.chains = config.chains;

    if (
      config.chainId &&
      !config.chains.find((chain) => chain.id === config.chainId)
    ) {
      throw new Error(`Chain ${config.chainId} not found in configuration`);
    }

    if (config.chainId) this.#chainId = config.chainId;

    this.debug = config.debug || false;
  }

  get chainId() {
    return this.#chainId;
  }

  setChainId(chainId: ChainId) {
    if (!this.chains.find((chain) => chain.id === chainId)) {
      throw new Error(`Chain ${chainId} not found in configuration`);
    }

    this.#chainId = chainId;
  }

  getChainConfig() {
    const chainId = this.chainId;

    if (!chainId) {
      throw new Error('ChainId not configured, call setChainId first');
    }

    const chain = this.chains.find((chain) => chain.id === chainId);

    if (!chain) {
      throw new Error(`Chain ${chainId} not found in configuration`);
    }

    switch (chainId) {
      case ChainId.SOPHON_MAINNET:
        return {
          publishableKey: chain.publishableKey,
          sponsor: chain.sponsor ?? false,
          authUrl: 'https://identity.onbeam.com',
          apiUrl: 'https://api.onbeam.com',
          rpcUrl: 'https://rpc.sophon.xyz',
        };

      case ChainId.SOPHON_TESTNET:
        if (chain.isPreview) {
          return {
            publishableKey: chain.publishableKey,
            sponsor: chain.sponsor ?? false,
            authUrl: 'https://identity.preview.onbeam.com',
            apiUrl: 'https://api.preview.onbeam.com',
            rpcUrl: 'https://rpc.testnet.sophon.xyz',
          };
        }

        return {
          publishableKey: chain.publishableKey,
          sponsor: chain.sponsor ?? false,
          authUrl: 'https://identity.testnet.onbeam.com',
          apiUrl: 'https://api.testnet.onbeam.com',
          rpcUrl: 'https://rpc.testnet.sophon.xyz',
        };

      case ChainId.BEAM_MAINNET:
        return {
          publishableKey: chain.publishableKey,
          sponsor: chain.sponsor ?? false,
          authUrl: 'https://identity.onbeam.com',
          apiUrl: 'https://api.onbeam.com',
          rpcUrl: 'https://build.onbeam.com/rpc',
        };

      case ChainId.BEAM_TESTNET:
        if (chain.isPreview) {
          return {
            publishableKey: chain.publishableKey,
            sponsor: chain.sponsor ?? false,
            authUrl: 'https://identity.preview.onbeam.com',
            apiUrl: 'https://api.preview.onbeam.com',
            rpcUrl: 'https://build.onbeam.com/rpc/testnet',
          };
        }

        return {
          publishableKey: chain.publishableKey,
          sponsor: chain.sponsor ?? false,
          authUrl: 'https://identity.testnet.onbeam.com',
          apiUrl: 'https://api.testnet.onbeam.com',
          rpcUrl: 'https://build.onbeam.com/rpc/testnet',
        };
    }
  }
}
