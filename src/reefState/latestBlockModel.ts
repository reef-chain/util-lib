export const enum AccountIndexedTransactionType {
  REEF20_TRANSFER,
  REEF_NFT_TRANSFER,
  REEF_BIND_TX,
}

export const allIndexedTransactions = [
  AccountIndexedTransactionType.REEF_BIND_TX,
  AccountIndexedTransactionType.REEF_NFT_TRANSFER,
  AccountIndexedTransactionType.REEF20_TRANSFER,
];

interface LatestBlock {
  blockHash: string;
  blockHeight: number;
  blockId: string;
}

export interface LatestBlockData extends LatestBlock {
  updatedAccounts: {
    REEF20Transfers: string[];
    REEF721Transfers: string[];
    REEF1155Transfers: string[];
    boundEvm: string[];
  };
  updatedContracts: string[];
}

export interface LatestAddressUpdates extends LatestBlock {
  addresses: string[];
}
