export enum Environment {
  PRODUCTION = 'production',
  PREVIEW = 'preview',
}

export enum ChainId {
  BEAM_MAINNET = 4337,
  BEAM_TESTNET = 13337,
}

export enum ChainName {
  BEAM_MAINNET = 'Beam',
  BEAM_TESTNET = 'Beam Testnet',
}

export type ChainConfig = {
  /** The chain id */
  id: ChainId;
  /** The publishableKey belonging to the chain */
  publishableKey: string;
  /** The chain environment. Not that setting this to 'preview' only has an effect on the testnet chain */
  environment?: Environment;
}[];

export type ClientConfig = {
  chains: ChainConfig;
  chainId: ChainId;
  debug?: boolean;
};

export type Session = {
  id: string;
  isActive: boolean;
  sessionAddress: string;
  startTime?: string | null;
  endTime?: string | null;
};
