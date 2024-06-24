import { v4 as uuidv4 } from 'uuid';
import { beamIcon } from '../icon';
import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from './types';

export const beamProviderInfo = {
  icon: beamIcon,
  name: 'Beam',
  rdns: 'com.onbeam.sdk',
  uuid: uuidv4(),
} as EIP6963ProviderInfo;

export function announceProvider(detail: EIP6963ProviderDetail) {
  if (typeof window === 'undefined') return;
  const event: CustomEvent<EIP6963ProviderDetail> = new CustomEvent(
    'eip6963:announceProvider',
    { detail: Object.freeze(detail) },
  ) as EIP6963AnnounceProviderEvent;

  window.dispatchEvent(event);

  const handler = () => window.dispatchEvent(event);
  window.addEventListener('eip6963:requestProvider', handler);
}
