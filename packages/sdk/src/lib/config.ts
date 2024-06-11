import { ClientConfig, Environment } from '../types';

export class BeamConfiguration {
  readonly environment: Environment;
  readonly publishableKey: string;
  readonly debug?: boolean;

  readonly authUrl: string;
  readonly apiUrl: string;

  constructor(config: ClientConfig) {
    this.environment = config.environment;
    this.publishableKey = config.publishableKey;
    this.debug = config.debug || false;

    switch (this.environment) {
      case Environment.MAINNET:
        this.authUrl = 'https://identity.onbeam.com';
        this.apiUrl = 'https://api.onbeam.com';
        break;

      case Environment.TESTNET:
        this.authUrl = 'https://identity.testnet.onbeam.com';
        this.apiUrl = 'https://api.testnet.onbeam.com';
        break;

      case Environment.PREVIEW:
        this.authUrl = 'https://identity.preview.onbeam.com';
        this.apiUrl = 'https://api.preview.onbeam.com';
        break;
    }
  }
}
