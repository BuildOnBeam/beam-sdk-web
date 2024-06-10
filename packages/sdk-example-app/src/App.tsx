import type {
  ClientConfig,
  GetAssetListingsResponseDataItem,
  GetAssetsForUserResponseDataItem,
  Session,
} from '@onbeam/sdk';
import { BeamClient, Environment } from '@onbeam/sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import beamLogo from '/beam-logo.png';

const entityId = import.meta.env.VITE_BEAM_ENTITY_ID;
const chainId = 13337; // Beam Testnet

const config: ClientConfig = {
  environment: Environment.PREVIEW,
  publishableKey: import.meta.env.VITE_BEAM_PUBLISHABLE_KEY,
  debug: true,
};

type Asset = {
  asset: GetAssetsForUserResponseDataItem;
  listings?: GetAssetListingsResponseDataItem[];
};

const App = () => {
  const client = useRef(new BeamClient(config));

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const session_ = await client.current.getActiveSession(
          entityId,
          chainId,
        );

        setSession(session_);

        if (session_) {
          fetchAssetsWithListings();
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

  // TODO add continuation support
  const fetchAssetsWithListings = useCallback(
    () =>
      Promise.all([
        client.current.api.getUserAssetsForGamePost(entityId, {
          chainId,
          contract: '0x8913d575CdFe16dC958c72009BF63e39CCAE795F',
          sortBy: 'acquiredAt', // Newest first
          sortDirection: 'desc',
        }),
        client.current.api.getListedAssetsForUser(entityId, {
          chainId,
          assetAddresses: ['0x8913d575CdFe16dC958c72009BF63e39CCAE795F'],
        }),
      ]).then(([assets_, listings_]) => {
        const assets = assets_.data.map((asset) => {
          const listings = listings_.data.filter(
            (listing) =>
              listing.assetAddress === asset.assetAddress &&
              listing.assetId === asset.assetId,
          );

          return { asset, listings };
        });

        setAssets(assets);
      }),

    [],
  );

  const mintAsset = useCallback(async () => {
    if (!session) return;

    try {
      /**
       * This payload is an example of minting an NFT using the Beam SDK.
       * After signing the operation, the NFT will be minted to the user's account
       * and discoverable via [Sphere](https://testnet.sphere.market/beam-testnet/collection/0x8913d575CdFe16dC958c72009BF63e39CCAE795F).
       */
      const operationPayload = {
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
      };

      const operation = await client.current.api.createUserTransaction(
        entityId,
        operationPayload,
      );

      if (!operation) {
        throw new Error('Failed to create user transaction.');
      }

      const signed = await client.current.signOperation(
        entityId,
        operation.id,
        chainId,
      );

      if (signed) {
        fetchAssetsWithListings();

        return;
      }

      setError('Failed to mint NFT.');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error.');
    }
  }, [session, fetchAssetsWithListings]);

  const listAsset = useCallback(
    async (asset: Asset['asset']) => {
      if (!session) return;

      try {
        const operation = await client.current.api.listAsset(entityId, {
          assetAddress: asset.assetAddress,
          assetId: asset.assetId,
          chainId,
          currency: 'BEAM',
          // startTime?: string | null;
          // endTime?: string | null;
          // operationId?: string | null;
          // operationProcessing?: SellAssetRequestInputOperationProcessing;
          // policyId?: string | null;
          price: '1', // 1 BEAM
          quantity: 1,
          sellType: 'FixedPrice',
          sponsor: true,
        });

        if (!operation) {
          throw new Error('Failed to create user transaction.');
        }

        const signed = await client.current.signOperation(
          entityId,
          operation.id,
          chainId,
        );

        if (signed) {
          fetchAssetsWithListings();

          return;
        }

        setError('Failed to list asset.');
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Unknown error.');
      }
    },
    [session, fetchAssetsWithListings],
  );

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
            <h2>Assets</h2>
            <ul>
              {assets.map(({ asset, listings }) => (
                <li key={asset.assetId}>
                  <img src={asset.imageUrl} alt={asset.name} />
                  <p>{asset.name}</p>

                  <ul>
                    {listings?.map((listing) => (
                      <li key={listing.id}>
                        <p>ID: {listing.id}</p>
                        <button
                          type="button"
                          onClick={() => cancelListing(listing)}
                        >
                          Cancel listing
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button type="button" onClick={() => listAsset(asset)}>
                    List
                  </button>
                </li>
              ))}
            </ul>

            {assets.length === 0 && <p>No assets minted (yet).</p>}
          </div>

          <div className="card">
            <button id="mintAssetButton" type="button" onClick={mintAsset}>
              Mint NFT
            </button>

            <button id="mintAssetButton" type="button" onClick={clearSession}>
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
