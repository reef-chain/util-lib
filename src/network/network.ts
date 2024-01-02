export type NetworkName = "mainnet" | "testnet" | "localhost";

export interface Network {
  rpcUrl: string;
  reefscanUrl: string;
  verificationApiUrl: string;
  name: NetworkName;
  graphqlExplorerUrl: string;
  genesisHash: string;
  options?: unknown;
}

export const SS58_REEF = 42;

export type Networks = Record<NetworkName, Network>;

export const AVAILABLE_NETWORKS: Networks = {
  testnet: {
    name: "testnet",
    rpcUrl: "wss://rpc-testnet.reefscan.com/ws",
    reefscanUrl: "https://testnet.reefscan.com",
    verificationApiUrl: "https://api-testnet.reefscan.com",
    graphqlExplorerUrl: "wss://squid.subsquid.io/reef-explorer-testnet/graphql",
    genesisHash:
      "0xb414a8602b2251fa538d38a9322391500bd0324bc7ac6048845d57c37dd83fe6",
  },
  mainnet: {
    name: "mainnet",
    rpcUrl: "wss://rpc.reefscan.com/ws",
    reefscanUrl: "https://reefscan.com",
    verificationApiUrl: "https://api.reefscan.com",
    graphqlExplorerUrl: "wss://squid.subsquid.io/reef-explorer/graphql",
    genesisHash:
      "0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7",
  },
  localhost: {
    name: "localhost",
    rpcUrl: "ws://localhost:9944",
    reefscanUrl: "http://localhost:8000",
    verificationApiUrl: "http://localhost:8001",
    graphqlExplorerUrl: "ws://localhost:8080/v1/graphql",
    genesisHash: "",
  },
};
