import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import './App.css';
import { Connect } from './components/Connect';
import { beamClient } from './main';
import { config } from './wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    if (!beamClient) return;
    beamClient.connectProvider(); // EIP-6963
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Connect />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
