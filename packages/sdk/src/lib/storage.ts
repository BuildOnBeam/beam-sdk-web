import { Hex } from 'viem';
import { Session } from '../types';

interface StorageContract<T> {
  get<K extends keyof T>(key: K): T[K] | null;

  set<K extends keyof T>(key: K, value: T[K]): void;

  remove<K extends keyof T>(key: K): void;

  clear(): void;
}

export enum StorageKey {
  ACCOUNT_ADDRESS = 'beam.account-address',
  ACCESS_TOKEN = 'beam.access-token',
  SESSION = 'beam.session',
  SIGNING_KEY = 'beam.signing-key',
}

export interface StorageKeys {
  [StorageKey.ACCOUNT_ADDRESS]: Record<number, string> | null;
  [StorageKey.ACCESS_TOKEN]: string | null;
  [StorageKey.SESSION]: Session | null;
  [StorageKey.SIGNING_KEY]: Hex | null;
}

export class StorageService<T> implements StorageContract<T> {
  constructor(private readonly storage: Storage) {}

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.storage.setItem(key.toString(), JSON.stringify(value));
  }

  get<K extends keyof T>(key: K): T[K] | null {
    const value = this.storage.getItem(key.toString());

    if (
      value === null ||
      value === 'null' ||
      value === undefined ||
      value === 'undefined'
    ) {
      return null;
    }

    return JSON.parse(value);
  }

  remove<K extends keyof T>(key: K): void {
    this.storage.removeItem(key.toString());
  }

  clear(): void {
    for (const key of Object.values(StorageKey)) {
      this.storage.removeItem(key);
    }
  }
}
