import type {
  ClientConfig,
  GetAssetListingsResponseDataItem,
  GetAssetsForUserResponseDataItem,
  GetUserResponse,
  Session,
} from '@onbeam/sdk';
import { BeamClient, ChainId } from '@onbeam/sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import beamLogo from '/beam-logo.png';

const entityId = import.meta.env.VITE_BEAM_ENTITY_ID;
const chainId = 13337; // Beam Testnet

const config: ClientConfig = {
  chains: [
    {
      chainId: ChainId.BEAM_TESTNET,
      publishableKey: import.meta.env.VITE_BEAM_PUBLISHABLE_KEY,
      isPreview: true,
    },
  ],
  debug: true,
};

type Asset = {
  asset: GetAssetsForUserResponseDataItem;
  listing?: GetAssetListingsResponseDataItem | null;
};

const App = () => {
  const client = useRef(new BeamClient(config));

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<GetUserResponse | null>(null);

  useEffect(() => {
    const init = async () => {
      setError(null);
      setLoading('Loading session...');

      try {
        const user = await client.current.api.getUser(entityId);

        if (user) {
          setUser(user);
        }

        const session_ = await client.current.getActiveSession(
          entityId,
          chainId,
        );

        if (session_) {
          setSession(session_);
          fetchAssetsWithListings();
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Unknown error.');
      } finally {
        setLoading(null);
      }
    };

    init();
  }, []);

  const createSession = useCallback(async () => {
    setError(null);
    setLoading('Creating session...');

    try {
      const session_ = await client.current.createSession(entityId, chainId);

      if (session_) {
        setSession(session_);
        setError(null);

        fetchAssetsWithListings();

        return;
      }

      setError('Failed to create session.');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error.');
    } finally {
      setLoading(null);
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await client.current.clearSession();

      setSession(null);
      setError(null);
      setAssets([]);
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
          const listing = listings_.data.filter(
            (listing) =>
              listing.assetAddress === asset.assetAddress &&
              listing.assetId === asset.assetId,
          )[0];

          return { asset, listing };
        });

        setAssets(assets);
      }),

    [],
  );

  const mintAsset = useCallback(async () => {
    if (!session || !user) return;

    setError(null);
    setLoading('Minting asset...');

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
              user.wallets.find((wallet) => wallet.chainId === chainId)
                ?.address,
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
    } finally {
      setLoading(null);
    }
  }, [session, user, fetchAssetsWithListings]);

  const listAsset = useCallback(
    async (asset: Asset['asset']) => {
      if (!session) return;

      setError(null);
      setLoading(`Listing asset ${asset.assetId}...`);

      try {
        const operation = await client.current.api.listAsset(entityId, {
          assetAddress: asset.assetAddress,
          assetId: asset.assetId,
          chainId,
          currency: 'BEAM',
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
      } finally {
        setLoading(null);
      }
    },
    [session, fetchAssetsWithListings],
  );

  const cancelListing = useCallback(
    async (listing: GetAssetListingsResponseDataItem) => {
      if (!session) return;

      setError(null);
      setLoading(`Cancelling asset ${listing.assetId} listing...`);

      try {
        const operation = await client.current.api.cancelListing(
          entityId,
          listing.id,
          {
            sponsor: true,
          },
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

        setError('Failed to list asset.');
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Unknown error.');
      } finally {
        setLoading(null);
      }
    },
    [session, fetchAssetsWithListings],
  );

  return (
    <div className="flex flex-col min-h-full gap-6">
      <a
        href="https://docs.onbeam.com/service/sdk"
        rel="noreferrer"
        target="_blank"
      >
        <img
          src={beamLogo}
          className="h-16 block mx-auto transition-all duration-300 will-change-auto hover:shadow-logo-hover"
          alt="Beam Docs"
        />
      </a>

      <h1 className="text-3xl font-semibold">Beam Web SDK Example</h1>

      {error && <div className="text-red-600 font-medium">{error}</div>}

      {loading && (
        <div className="text-gray-400 font-medium flex items-center gap-2 mx-auto">
          <div
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-gray-500 border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] "
            role="status"
          />
          {loading}
        </div>
      )}

      {!session && (
        <div>
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
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Session</h2>

              <button id="mintAssetButton" type="button" onClick={clearSession}>
                Clear
              </button>
            </div>

            <div className="border-2 border-gray-600 rounded-lg overflow-hidden py-4 px-6">
              Valid until {new Date(session.endTime!).toLocaleString()}.
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Assets {assets.length > 0 ? `(${assets.length})` : ''}
              </h2>

              <button id="mintAssetButton" type="button" onClick={mintAsset}>
                Mint
              </button>
            </div>
            <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
              {!assets.length ? (
                <div className="flex items-center justify-center h-[120px]">
                  <p>No assets minted (yet).</p>
                </div>
              ) : (
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b-2">
                    <tr className="border-gray-600 text-gray-200">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">
                        Image
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="h-12 px-4 align-middle font-medium text-muted-foreground  text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="[&_tr:last-child]:border-0">
                    {assets.map(({ asset, listing }) => (
                      <tr
                        key={asset.assetId}
                        className="border-b-2 border-gray-600 hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">
                          <img
                            src={asset.imageUrl}
                            alt={asset.name}
                            width="64"
                            height="64"
                            className="aspect-square object-cover rounded-md"
                          />
                        </td>

                        <td className="p-4 align-middle text-left font-medium">
                          <span className="font-medium text-lg">
                            {asset.name}
                          </span>
                          <a
                            href={`https://preview.sphere.market/beam-testnet/nft/0x8913d575CdFe16dC958c72009BF63e39CCAE795F/${asset.assetId}`}
                            rel="noreferrer"
                            target="_blank"
                            className="block"
                          >
                            View on Sphere
                          </a>
                        </td>

                        <td className="p-4 align-middle text-right">
                          {listing ? (
                            <button
                              type="button"
                              onClick={() => cancelListing(listing)}
                            >
                              Cancel listing
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => listAsset(asset)}
                            >
                              List for 1 BEAM
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      <p className="text-gray-400">
        Click on the Beam logo to view the SDK docs.
      </p>
    </div>
  );
};

export default App;
