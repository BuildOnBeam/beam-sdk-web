import { Session } from 'types';

export const isSessionValid = (session: Session | null): boolean => {
  if (!session || !session.isActive) return false;

  const now = Date.now();

  return (
    Number(session.startTime ?? 0) <= now && Number(session.endTime ?? 0) >= now
  );
};

export const isSessionOwnedBy = (
  session: Session | null,
  address: string,
): boolean => {
  return session?.sessionAddress === address;
};
