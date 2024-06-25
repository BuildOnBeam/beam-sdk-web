import { useCallback, useEffect, useState } from 'react';
import { encodeFunctionData, parseAbi } from 'viem';
import { useAccount } from 'wagmi';

function MintERC20() {
  const { connector } = useAccount();
  const [toAddress, setToAddress] = useState<string | null>(null);

  useEffect(() => {
    const getAddress = async () => {
      const provider = await connector?.getProvider();

      if (provider) {
        const [walletAddress] = await provider.request({
          method: 'eth_requestAccounts',
        });
        setToAddress(walletAddress || '');
      }
    };

    getAddress().catch(console.log);
  }, [connector]);

  const handleSubmit = useCallback(() => {
    const mint = async () => {
      const provider = await connector?.getProvider();

      if (provider) {
        const abi = parseAbi([
          'function safeMint(address to, uint256 tokenId) payable',
        ]);

        const _data = encodeFunctionData({
          abi,
          functionName: 'safeMint',
          args: [
            toAddress,
            'bafybeiend3mtarqmkgfa4uqqkb2ucv7dnshbhdzbwr6tcosbtsxkdlpq6q/0.json',
          ],
        });

        provider.request({
          method: 'eth_sendTransaction',
          params: [toAddress],
        });
      }
    };

    mint().catch(console.log);
  }, [connector, toAddress]);

  return (
    <div>
      <button type="button" onClick={() => handleSubmit()}>
        Mint to {toAddress}
      </button>
    </div>
  );
}

export default MintERC20;
