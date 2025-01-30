import { useAccount, useAccountEffect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

import { Account } from './Account';
import { ConnectorsList } from './ConnectorsList';
import { useState } from 'react';

export function Connect() {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [signature, setSignature] = useState<string | null>(null);

  useAccountEffect({
    async onConnect({ address, chainId }) {
      const statement = 'Verify your account';

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement,
        uri: window.location.origin,
        version: '1',
        chainId,
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      setSignature(signature);
    },
    onDisconnect() {
      console.log('Disconnected!');
    },
  });

  return (
    <div className="container">
      {signature && <div>Signature: {signature}</div>}
      {isConnected ? <Account /> : <ConnectorsList />}
    </div>
  );
}
