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
    factoryAddress: "0x8Fc2f9577f6c58e6A91C4A80B45C03d1e71c031f",
    routerAddress: "0xd855a7c33ebF6566e846B0D6F7Ba7f7e1fe99768",
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
