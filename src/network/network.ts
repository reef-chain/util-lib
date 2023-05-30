export type NetworkName = "mainnet" | "testnet" | "localhost";

export interface Network {
  rpcUrl: string;
  reefscanUrl: string;
  verificationApiUrl: string;
  name: NetworkName;
  graphqlUrl: string;
  genesisHash: string;
  reefscanFrontendUrl: string;
  factoryAddress: string;
  routerAddress: string;
  graphqlDexsUrl: string;
}

export const SS58_REEF = 42;

export type Networks = Record<NetworkName, Network>;

export const AVAILABLE_NETWORKS: Networks = {
  testnet: {
    name: "testnet",
    rpcUrl: "wss://rpc-testnet.reefscan.info/ws",
    reefscanUrl: "https://testnet.reefscan.info",
    verificationApiUrl: "https://api-testnet.reefscan.com",
    graphqlUrl: "wss://squid.subsquid.io/reef-explorer-testnet/graphql",
    genesisHash:
      "0xb414a8602b2251fa538d38a9322391500bd0324bc7ac6048845d57c37dd83fe6",
    reefscanFrontendUrl: "https://testnet.reefscan.info",
    factoryAddress: "0x06D7a7334B9329D0750FFd0a636D6C3dFA77E580",
    routerAddress: "0xa29DFc7329ac30445Ba963E313fD26E171722057",
    graphqlDexsUrl: "https://squid.subsquid.io/reef-swap-testnet/graphql",
  },
  mainnet: {
    name: "mainnet",
    rpcUrl: "wss://rpc.reefscan.info/ws",
    reefscanUrl: "https://reefscan.info",
    verificationApiUrl: "https://api.reefscan.com",
    graphqlUrl: "wss://squid.subsquid.io/reef-explorer/graphql",
    genesisHash:
      "0x7834781d38e4798d548e34ec947d19deea29df148a7bf32484b7b24dacf8d4b7",
    reefscanFrontendUrl: "https://reefscan.info",
    factoryAddress: "0x380a9033500154872813F6E1120a81ed6c0760a8",
    routerAddress: "0x641e34931C03751BFED14C4087bA395303bEd1A5",
    graphqlDexsUrl: "https://squid.subsquid.io/reef-swap/graphql",
  },
  localhost: {
    name: "localhost",
    rpcUrl: "ws://localhost:9944",
    reefscanUrl: "http://localhost:8000",
    verificationApiUrl: "http://localhost:8001",
    graphqlUrl: "ws://localhost:8080/v1/graphql",
    genesisHash: "",
    reefscanFrontendUrl: "http://localhost:3000",
    factoryAddress: "",
    routerAddress: "",
    graphqlDexsUrl: "http://localhost:4351/graphql",
  },
};
