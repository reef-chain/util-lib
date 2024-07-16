import axios from "axios";
import { firstValueFrom } from "rxjs";
import { httpClientInstance$, queryGql$ } from "src/graphql";
import { getReefswapNetworkConfig } from "src/network";
import { selectedNetwork$ } from "src/reefState";
import { getIconUrl } from "src/token/getIconUrl";
import { getIpfsUrl } from "src/token/nftUtil";

const getTokenIconExplorerQuery = (tokenAddresses: string[]) => {
  const formattedAddresses = tokenAddresses
    .map(address => `"${address}"`)
    .join(", ");
  return {
    query: `
    query TokenIconQuery {
      verifiedContracts(where: { id_in: [${formattedAddresses}] }) {
        contractData
        id
      }
    }
    `,
    variables: {},
  };
};

const getTokenIconSwapQuery = (tokenAddresses: string[]) => {
  const formattedAddresses = tokenAddresses
    .map(address => `"${address}"`)
    .join(", ");
  return {
    query: `
   query SwapTokenIconQuery {
      tokens(where: {id_in: [${formattedAddresses}]}) {
        id
        iconUrl
      }
    }
    `,
    variables: {},
  };
};

// expects array of token addresses, which are resolved from single function call
export const resolveTokenUrl = async (tokenAddresses: string[]) => {
  const tokenIconsMap = {};
  try {
    const httpClient = await firstValueFrom(httpClientInstance$);
    const explorerResult = await firstValueFrom(
      queryGql$(httpClient, getTokenIconExplorerQuery(tokenAddresses))
    );
    if (explorerResult.data) {
      explorerResult.data.verifiedContracts.forEach(v => {
        if (v.contractData && v.contractData["iconUrl"]) {
          const iconUrl = v.contractData["iconUrl"].startsWith("ipfs://")
            ? getIpfsUrl(v.contractData["iconUrl"].split("ipfs://")[1])
            : v.contractData["iconUrl"];
          tokenIconsMap[v.id] = iconUrl;
        } else {
          tokenIconsMap[v.id] = v.contractData["iconUrl"];
        }
      });
    }

    // an array of token addresses with no icon in explorer squid
    const tokensWithNoIconUrl = [];

    tokenAddresses.forEach(tokenAddress => {
      if (!tokenIconsMap[tokenAddress]) {
        tokensWithNoIconUrl.push(tokenAddress);
      }
    });

    const network = await firstValueFrom(selectedNetwork$);

    const dexHttpClient = axios.create({
      baseURL: getReefswapNetworkConfig(network).graphqlDexsUrl,
    });

    const swapResult = await firstValueFrom(
      queryGql$(dexHttpClient, getTokenIconSwapQuery(tokensWithNoIconUrl))
    );

    if (swapResult.data) {
      swapResult.data.tokens.forEach(
        tkn =>
          (tokenIconsMap[tkn.id] =
            tkn.iconUrl == "" ? getIconUrl(tkn.id) : tkn.iconUrl)
      );
    }

    return tokenIconsMap;
  } catch (error) {
    console.log("resolveTokenUrl error===", error);
    return {};
  }
};
