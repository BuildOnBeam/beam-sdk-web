import { useCallback, useEffect, useState } from 'react';
import { Hex, encodeFunctionData, parseAbi } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

const contractAddress = '0x8913d575CdFe16dC958c72009BF63e39CCAE795F';

function SetApprovalForAll() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [fromAddress, setFromAddress] = useState<Hex | null>(null);

  useEffect(() => {
    if (address) {
      setFromAddress(address);
    }
  }, [address]);

  const handleSubmit = useCallback(async () => {
    if (!walletClient || !fromAddress) return;

    const abi = parseAbi([
      'function setApprovalForAll(address to, bool approved)',
    ]);

    const data = encodeFunctionData({
      abi,
      functionName: 'setApprovalForAll',
      args: [fromAddress, true],
    });

    const value = '0xde0b6b3a7640000'; // 1 ETH in hex

    await walletClient.request({
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
  }, [walletClient, fromAddress]);

  return (
    <div>
      <button type="button" onClick={handleSubmit}>
        Approve for {fromAddress}
      </button>
    </div>
  );
}

export default SetApprovalForAll;
