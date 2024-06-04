export enum Environment {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  PREVIEW = "preview",
}

export type ClientConfig = {
  environment: Environment;
  publishableKey: string;
  debug?: boolean;
};

export type Session = {
  id: string;
  isActive: boolean;
  sessionAddress: string;
  startTime?: string | null;
  endTime?: string | null;
};
