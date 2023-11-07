import { REEF_TOKEN, Token } from "../token";
import { NetworkName } from "./network";

export interface Bond {
  name: string;
  description: string;
  contractAddress: string;
  validatorAddress: string;
  stake: Token;
  farm: Token;
  apy: string;
}

const bondsMainnet: Bond[] = [
  {
    name: "Reef community staking bond",
    description: "",
    contractAddress: "0x7D3596b724cEB02f2669b902E4F1EEDeEfad3be6",
    validatorAddress: "5Hax9GZjpurht2RpDr5eNLKvEApECuNxUpmRbYs5iNh7LpHa",
    stake: { ...REEF_TOKEN },
    farm: { ...REEF_TOKEN },
    apy: "32",
  },
];

export const bonds: Record<NetworkName, Bond[]> = {
  mainnet: bondsMainnet,
  testnet: [],
  localhost: [],
};
