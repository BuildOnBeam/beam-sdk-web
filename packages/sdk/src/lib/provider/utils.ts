import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { TypedDataPayload } from './types';

const REQUIRED_TYPED_DATA_PROPERTIES = [
  'types',
  'domain',
  'primaryType',
  'message',
];
const isValidTypedDataPayload = (
  typedData: object,
): typedData is TypedDataPayload =>
  REQUIRED_TYPED_DATA_PROPERTIES.every((key) => key in typedData);

export function parseAndValidateTypedData(
  typedData: string | object,
  chainId: number,
) {
  let transformedTypedData: object | TypedDataPayload;

  if (typeof typedData === 'string') {
    try {
      transformedTypedData = JSON.parse(typedData);
    } catch (err: any) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        `Failed to parse typed data JSON: ${err}`,
      );
    }
  } else if (typeof typedData === 'object') {
    transformedTypedData = typedData;
  } else {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `Invalid typed data argument: ${typedData}`,
    );
  }

  if (!isValidTypedDataPayload(transformedTypedData)) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      `Invalid typed data argument. The following properties are required: ${REQUIRED_TYPED_DATA_PROPERTIES.join(', ')}`,
    );
  }

  const providedChainId: number | string | undefined = (
    transformedTypedData as any
  ).domain?.chainId;
  if (providedChainId) {
    // domain.chainId (if defined) can be a number, string, or hex value, but we only accept a number.
    if (typeof providedChainId === 'string') {
      if (providedChainId.startsWith('0x')) {
        transformedTypedData.domain.chainId = Number.parseInt(
          providedChainId,
          16,
        );
      } else {
        transformedTypedData.domain.chainId = Number.parseInt(
          providedChainId,
          10,
        );
      }
    }

    if (transformedTypedData.domain.chainId !== chainId) {
      throw new JsonRpcError(
        RpcErrorCode.INVALID_PARAMS,
        `Invalid chainId, expected ${chainId}`,
      );
    }
  }

  return transformedTypedData;
}
