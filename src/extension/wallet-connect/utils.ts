import { ProposalTypes } from "@walletconnect/types";

import { AVAILABLE_NETWORKS } from "../../network";

export enum WC_DEFAULT_METHODS {
  REEF_SIGN_TRANSACTION = "reef_signTransaction",
  REEF_SIGN_MESSAGE = "reef_signMessage",
}

export const genesisHashToWcChainId = (genesisHash: string): string => {
  return `reef:${genesisHash.substring(2, 34)}`;
};

export const WC_MAINNET_CHAIN_ID = genesisHashToWcChainId(
  AVAILABLE_NETWORKS.mainnet.genesisHash
);
export const WC_TESTNET_CHAIN_ID = genesisHashToWcChainId(
  AVAILABLE_NETWORKS.testnet.genesisHash
);

export const getWcRequiredNamespaces = (): ProposalTypes.RequiredNamespaces => {
  return {
    reef: {
      methods: Object.values(WC_DEFAULT_METHODS),
      chains: [
        genesisHashToWcChainId(AVAILABLE_NETWORKS["mainnet"].genesisHash),
        genesisHashToWcChainId(AVAILABLE_NETWORKS["testnet"].genesisHash),
      ],
      events: [],
    },
  };
};
