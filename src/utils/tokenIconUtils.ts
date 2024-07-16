// anukulpandey
// first fetch the token icon from pool if it is '' then fetch from explorer squid if it is also empty then fetch from the contractData info, if its still empty then resolve it from the base64 strings

import { firstValueFrom } from "rxjs";
import { httpClientInstance$, queryGql$ } from "src/graphql";
import { selectedNetwork$ } from "src/reefState";
import { getIpfsUrl } from "src/token/nftUtil";

//reference to fetch explorer token icon
/*
const getExplorerTokenIcon = async (nwName: string, tokenAddresses: string[]) => {
  const response = await fetch(getExplorerUrl(nwName), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getTokenIconQuery(tokenAddresses)),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const { data } = await response.json();
  const tokenIconMap = {};
  data.verifiedContracts.forEach((v) => {
    if (v.contractData && v.contractData['iconUrl']) {
      const iconUrl = v.contractData['iconUrl'].startsWith("ipfs://")
          ? "https://reef.infura-ipfs.io/ipfs/" + v.contractData['iconUrl'].split("ipfs://")[1]
          : v.contractData['iconUrl'];
          tokenIconMap[v.id] =iconUrl;
  } else {
    tokenIconMap[v.id] =v.contractData['iconUrl'];
  }
  })

  return tokenIconMap;
};

*/

//reference to fetch token icon from explorer contract data
/*

const getTokenIconQuery = (tokenAddresses: string[]) => {
  const formattedAddresses = tokenAddresses.map(address => `"${address}"`).join(", ");
  return {
    query: `
    query TokenIconQuery {
      verifiedContracts(where: { id_in: [${formattedAddresses}] }) {
        contractData
        id
      }
    }
    `
  };
};
*/

const getTokenIconQuery = (tokenAddresses: string[]) => {
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

export const resolveTokenUrl = async (tokenAddresses: string[]) => {
  const tokenIconsMap = {};
  try {
    const httpClient = await firstValueFrom(httpClientInstance$);
    const result = await firstValueFrom(
      queryGql$(httpClient, getTokenIconQuery(tokenAddresses))
    );
    if (result.data) {
      result.data.verifiedContracts.forEach(v => {
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
    console.log(tokenIconsMap);
  } catch (error) {
    console.log("resolveTokenUrl error===", error);
  }
};
