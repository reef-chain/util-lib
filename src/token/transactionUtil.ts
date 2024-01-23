import { AVAILABLE_NETWORKS, Network } from "../network/network";
import { ReefAccount, ReefSigner } from "../account/accountModel";
import {
  toTxErrorCodeValue,
  TX_STATUS_ERROR_CODE,
} from "../transaction/txErrorUtil";

export type TxStatusHandler = (status: TxStatusUpdate) => void;

export interface TxStatusUpdate {
  txIdent: string;
  txHash?: string;
  error?: { message: string; code: TX_STATUS_ERROR_CODE };
  isInBlock?: boolean;
  isComplete?: boolean;
  txTypeEvm?: boolean;
  url?: string;
  componentTxType?: string;
  addresses?: string[];
}

export const handleErr = (
  e: { message: string } | string,
  txIdent: string,
  txHash: string,
  txHandler: TxStatusHandler,
  signer: ReefAccount
): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let { message, code } = toTxErrorCodeValue(e);
  txHandler({
    txIdent,
    txHash,
    error: { message, code },
    addresses: [signer.address],
  });
};

export const getExtrinsicUrl = (
  id: string,
  network: Network = AVAILABLE_NETWORKS.mainnet
): string => `${network.reefscanUrl}/extrinsic/${id}`;
export const getContractUrl = (
  address: string,
  network: Network = AVAILABLE_NETWORKS.mainnet
): string => `${network.reefscanUrl}/contract/${address}`;

export const getTransferUrl = (
  blockHeight: string,
  extrinsicIndex: string,
  eventIndex: string,
  network: Network = AVAILABLE_NETWORKS.mainnet
): string =>
  `${network.reefscanUrl}/transfer/${blockHeight}/${extrinsicIndex}/${eventIndex}`;
