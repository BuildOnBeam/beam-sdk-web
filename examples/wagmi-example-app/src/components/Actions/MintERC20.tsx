import { useCallback, useEffect, useState } from 'react';
import { Hex, encodeFunctionData, parseAbi } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

function MintERC20() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [toAddress, setToAddress] = useState<Hex | null>(null);

  useEffect(() => {
    if (address) {
      setToAddress(address);
    }
  }, [address]);

  const handleSubmit = useCallback(async () => {
    if (!walletClient || !toAddress) return;

    const abi = parseAbi([
      'function safeMint(address to, uint256 tokenId) payable',
    ]);

    const data = encodeFunctionData({
      abi,
      functionName: 'safeMint',
      args: [toAddress, BigInt(1)],
    });

    await walletClient.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: toAddress,
          to: toAddress,
          data,
        },
      ],
    });
  }, [walletClient, toAddress]);

  return (
    <div>
      <button type="button" onClick={handleSubmit}>
        Mint to {toAddress}
      </button>
    </div>
  );
}

export default MintERC20;
