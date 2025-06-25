import { BeamClient, ChainId } from '@onbeam/sdk';

const config = {
  chainId: ChainId.BEAM_MAINNET,
  chains: [
    {
      id: ChainId.BEAM_MAINNET,
      publishableKey: import.meta.env.VITE_BEAM_PUBLISHABLE_KEY, // Create your own API key through https://dashboard.onbeam.com
    },
  ],
};

export const beam = new BeamClient(config);
