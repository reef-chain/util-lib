import { Network } from "./network";

export interface DexProtocolv2 {
  routerAddress: string;
  factoryAddress: string;
  graphqlDexsUrl: string;
}

export const REEFSWAP_CONFIG: { [networkName: string]: DexProtocolv2 } = {
  mainnet: {
    factoryAddress: "0x380a9033500154872813F6E1120a81ed6c0760a8",
    routerAddress: "0x641e34931C03751BFED14C4087bA395303bEd1A5",
    graphqlDexsUrl: "https://squid.subsquid.io/reef-swap/graphql",
  },
  testnet: {
    factoryAddress: "0x91e24d4E9CbF443E4D00E35edB61be763499533c",
    routerAddress: "0xfb5a06725de6df44806F806A09D160A6F09b53Ed",
    graphqlDexsUrl: "https://squid.subsquid.io/reef-swap-testnet/graphql",
  },
  localhost: {
    factoryAddress: "",
    routerAddress: "",
    graphqlDexsUrl: "http://localhost:4351/graphql",
  },
};

export const getReefswapNetworkConfig = (network: Network): DexProtocolv2 => {
  return REEFSWAP_CONFIG[network.name];
};
