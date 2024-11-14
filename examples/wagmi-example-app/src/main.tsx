import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BeamClient, ClientConfig, ChainId } from '@onbeam/sdk';

const config: ClientConfig = {
  chainId: ChainId.BEAM_TESTNET,
  chains: [
    {
      id: ChainId.BEAM_TESTNET,
      publishableKey: import.meta.env.VITE_BEAM_PUBLISHABLE_KEY,
      isPreview: true,
    },
  ],
  debug: true,
};

export const beamClient = new BeamClient(config);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
