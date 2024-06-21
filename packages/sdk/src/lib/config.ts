import { ClientConfig, Environment } from '../types';

export class BeamConfiguration {
  readonly environment: Environment;
  readonly publishableKey: string;
  readonly debug?: boolean;

  readonly authUrl: string;
  readonly apiUrl: string;
  readonly rpcUrl: string;

  constructor(config: ClientConfig) {
    this.environment = config.environment;
    this.publishableKey = config.publishableKey;
    this.debug = config.debug || false;

    switch (this.environment) {
      case Environment.MAINNET:
        this.authUrl = 'https://identity.onbeam.com';
        this.apiUrl = 'https://api.onbeam.com';
        this.rpcUrl = 'https://build.onbeam.com/rpc';
        break;

      case Environment.TESTNET:
        this.authUrl = 'https://identity.testnet.onbeam.com';
        this.apiUrl = 'https://api.testnet.onbeam.com';
        this.rpcUrl = 'https://build.onbeam.com/rpc/testnet';
        break;

      case Environment.PREVIEW:
        this.authUrl = 'http://localhost:3000'; // 'https://identity.preview.onbeam.com';
        this.apiUrl = 'https://api.preview.onbeam.com';
        this.rpcUrl = 'https://build.onbeam.com/rpc/testnet';
        break;

      default:
        throw new Error(`Invalid Beam environment: ${this.environment}`);
    }
  }
}
