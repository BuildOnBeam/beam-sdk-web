import { useCallback, useEffect, useState } from 'react';
import { Hex, encodeFunctionData, parseAbi } from 'viem';
import { useAccount } from 'wagmi';

const contractAddress = '0x8913d575CdFe16dC958c72009BF63e39CCAE795F';

function SetApprovalForAll() {
  const { connector } = useAccount();
  const [fromAddress, setFromAddress] = useState<Hex | null>(null);

  useEffect(() => {
    const getAddress = async () => {
      const provider = await connector?.getProvider();

      if (provider) {
        const [walletAddress] = await provider.request({
          method: 'eth_requestAccounts',
        });
        setFromAddress(walletAddress || '');
      }
    };

    getAddress().catch(console.log);
  }, [connector]);

  const handleSubmit = useCallback(() => {
    const approve = async () => {
      const provider = await connector?.getProvider();

      if (provider && fromAddress) {
        const abi = parseAbi([
          'function setApprovalForAll(address to, bool approved)',
        ]);

        const data = encodeFunctionData({
          abi,
          functionName: 'setApprovalForAll',
          args: [fromAddress, true],
        });

        const value = '1000000000000000000';

        await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: fromAddress,
              to: contractAddress,
              value,
              data,
            },
          ],
        });
      }
    };

    approve().catch(console.log);
  }, [connector, fromAddress]);

  return (
    <div>
      <button type="button" onClick={() => handleSubmit()}>
        Aprove for {fromAddress}
      </button>
    </div>
  );
}

export default SetApprovalForAll;
