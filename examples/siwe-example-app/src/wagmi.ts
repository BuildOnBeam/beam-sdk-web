import { http, createConfig } from 'wagmi';
import { beamTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [beamTestnet],
  connectors: [injected()],
  transports: {
    [beamTestnet.id]: http(),
  },
});
