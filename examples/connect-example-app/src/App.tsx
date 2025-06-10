import './App.css';
import { beam } from './beam';

function App() {
  /**
   * Beam.connectUserToGame provides you with a user wallet address without having to use the EIP1193 standard.
   * This allows you to connect to Beam wallets without using wagmi.sh/rainbowkit or other web3 implementation libraries.
   */
  async function handleConnect() {
    const result = await beam.connectUserToGame();
    alert(`the user address is ${result.address}`);
  }

  return (
    <button type="button" onClick={handleConnect}>
      Connect to beam
    </button>
  );
}

export default App;
