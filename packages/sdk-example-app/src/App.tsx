import './styles.css';
import type { ClientConfig, Session } from '@onbeam/sdk';
import { Environment } from '@onbeam/sdk';
import { BeamClient } from '@onbeam/sdk';
import beamLogo from '/beam-logo.png';
import { useCallback, useEffect, useRef, useState } from 'react';

const entityId = import.meta.env.VITE_BEAM_ENTITY_ID;
const chainId = Number(import.meta.env.VITE_BEAM_CHAIN_ID);

const config: ClientConfig = {
  environment: Environment.PREVIEW,
  publishableKey: import.meta.env.VITE_BEAM_PUBLISHABLE_KEY,
  debug: true,
};

const App = () => {
  const client = useRef(new BeamClient(config));

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const session_ = await client.current.getActiveSession(
          entityId,
          chainId,
        );

        setSession(session_);

        if (session_) {
          client.current.api.getUser(entityId).then((_user) => {});

          client.current.api
            .getUserAssetsForGamePost(entityId, {
              chainId,
              // contract: '0xb33A26f81bB89b653A2363cE13ED983B39613372',
              includeAttributes: true,
            })
            .then((_assets) => {});
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Unknown error.');
      }
    };

    init();
  }, []);

  const createSession = useCallback(async () => {
    try {
      const session_ = await client.current.createSession(entityId, chainId);

      if (session_) {
        setSession(session_);
        setError(null);

        return;
      }

      setError('Failed to create session.');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error.');
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await client.current.clearSession();

      setSession(null);
      setError(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error.');
    }
  }, []);

  const mintNFT = useCallback(async () => {
    if (!session) return;

    try {
      const operation = await client.current.api.createUserTransaction(
        entityId,
        {
          chainId,
          interactions: [
            {
              contractAddress: '0x8913d575CdFe16dC958c72009BF63e39CCAE795F',
              functionName: 'safeMint',
              functionArgs: [
                '0xb33A26f81bB89b653A2363cE13ED983B39613372',
                'bafybeiend3mtarqmkgfa4uqqkb2ucv7dnshbhdzbwr6tcosbtsxkdlpq6q/0.json',
              ],
            },
          ],
          sponsor: true,
        },
      );

      if (!operation) {
        throw new Error('Failed to create user transaction.');
      }

      // Create user operation
      // sign operation using browser

      const signed = await client.current.signOperation(
        entityId,
        operation.id,
        chainId,
      );

      if (signed) {
        return;
      }

      setError('Failed to mint NFT.');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error.');
    }
  }, [session]);

  return (
    <div>
      <a
        href="https://docs.onbeam.com/service/sdk"
        rel="noreferrer"
        target="_blank"
      >
        <img src={beamLogo} className="logo" alt="Beam Docs" />
      </a>
      <h1>Beam SDK Web Example</h1>

      {!session && (
        <div className="card">
          <button
            id="createSessionButton"
            type="button"
            onClick={createSession}
          >
            Create a session
          </button>
        </div>
      )}

      {session && (
        <>
          <div className="session-details">Session ID: {session.id}</div>

          <div className="card">
            <button id="mintNFTButton" type="button" onClick={mintNFT}>
              Mint NFT
            </button>

            <button id="mintNFTButton" type="button" onClick={clearSession}>
              Clear session
            </button>
          </div>
        </>
      )}

      {error && <div className="error">{error}</div>}

      <p className="read-the-docs">Click on the Beam logo to learn more</p>
    </div>
  );
};

export default App;

// async function init() {
//   try {
//     const session = await client.getActiveSession(entityId, 13337);

//     if (session) {
//       document.querySelector<HTMLDivElement>('#session-details')!.innerHTML = `
//         <p>Session ID: ${session.id}</p>
//         <p>Session Address: ${session.sessionAddress}</p>
//       `;
//     }

//     return;
//   } catch (error) {
//     console.error(error);

//     document
//       .querySelector<HTMLButtonElement>('#createSessionButton')!
//       .addEventListener('click', async () => {
//         try {
//           const session = await client.createSession(entityId, 13337);

//           if (session) {
//             document.querySelector<HTMLDivElement>(
//               '#session-details',
//             )!.innerHTML = `
//             <p>Session ID: ${session.id}</p>
//             <p>Session Address: ${session.sessionAddress}</p>
//           `;
//           }
//         } catch (error) {
//           console.error(error);
//         }
//       });
//   }
// }

// init();
