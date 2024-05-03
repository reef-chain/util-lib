import { ProposalTypes } from "@walletconnect/types";

import { AVAILABLE_NETWORKS } from "../../network";

export enum DEFAULT_REEF_METHODS {
  REEF_SIGN_TRANSACTION = "reef_signTransaction",
  REEF_SIGN_MESSAGE = "reef_signMessage",
}

export enum DEFAULT_REEF_EVENTS {}

export const genesisHashToChainId = (genesisHash: string): string => {
  return `reef:${genesisHash.substring(2, 34)}`;
};

export const MAINNET_CHAIN_ID = genesisHashToChainId(
  AVAILABLE_NETWORKS.mainnet.genesisHash
);
export const TESTNET_CHAIN_ID = genesisHashToChainId(
  AVAILABLE_NETWORKS.testnet.genesisHash
);

export const getRequiredNamespaces = (): ProposalTypes.RequiredNamespaces => {
  return {
    reef: {
      methods: Object.values(DEFAULT_REEF_METHODS),
      chains: [
        genesisHashToChainId(AVAILABLE_NETWORKS["mainnet"].genesisHash),
        genesisHashToChainId(AVAILABLE_NETWORKS["testnet"].genesisHash),
      ],
      events: Object.values(DEFAULT_REEF_EVENTS) as any[],
    },
  };
};
