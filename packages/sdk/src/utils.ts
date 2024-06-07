import { privateKeyToAccount } from 'viem/accounts';
import { Session } from './types';

export const isSessionValid = (session: Session | null): boolean => {
  if (!session || !session.isActive) return false;

  const now = Date.now();

  return (
    // TODO check if times can be optional
    Date.parse(session.startTime!).valueOf() <= now &&
    Date.parse(session.endTime!).valueOf() >= now
  );
};

export const isSessionOwnedBy = (
  session: Session | null,
  key: string,
): boolean => {
  const account = privateKeyToAccount(key as `0x${string}`);

  return (
    session?.sessionAddress?.toLowerCase() === account.address?.toLowerCase()
  );
};
