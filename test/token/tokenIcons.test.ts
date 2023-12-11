import { beforeAll, describe, it } from "vitest";
import { initReefState, selectedTokenBalances$ } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { firstValueFrom, skip } from "rxjs";

describe("graphql tests", () => {
  const accountId = "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP";
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: accountId,
            isSelected: true,
            meta: { source: "reef" },
          },
        ],
        injectedSigner: {},
      },
    });
  });

  it("should log list of tokens", async () => {
    const axios = require("axios");
    const { from, map } = require("rxjs");

    const distinctAddr = [
      "0xF881F66FFAE3C017D4d59244857f7AB6B5B5CF35",
      "0x7F12d5d92F9b4E250fe3f0302A29F6F93cBBBD8D",
      "0x412d843D5FC9abA5CDEb40b56c06b2e728c7D57C",
      "0x5130AC902A2128F890b714bE269a44FA37f5d78D",
      "0xE190554CF2CCF1D18201711aD39a7517595c0A34",
      "0x5039Bf569428B4bA2B521902f563Fe088cCF5062",
      "0x7F46307B989F1eE14f140c5525A143639B38b5fA",
      "0x5f4A3bAEB65324ff0Afd765379517Fc982D67aa4",
      "0xD86B0E03A8D873275D5d9cc7b443FA6dAA56b545",
      "0xae6a688a2a72ba9614cD3Cb7F320a3108d6a4a9D",
      "0x810678BdD2Cf7c5D492Cb8B930975c172cE964AC",
      "0xC8D55c9706fa2E72699a72936474F4c393B302aC",
    ];
    const CONTRACT_DATA_QUERY = `
  query contract_data_query($addresses: [String!]!) {
    verifiedContracts(where: { id_in: $addresses }, limit: 300) {
      id
      contractData
    }
  }
`;

    const getContractDataQuery = addresses => {
      return {
        query: CONTRACT_DATA_QUERY,
        variables: { addresses },
      };
    };
    const graphql = JSON.stringify(getContractDataQuery(distinctAddr));

    from(
      axios
        .post(
          "https://squid.subsquid.io/reef-explorer-testnet/graphql",
          graphql,
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then(response => {
          return response.data;
        })
    )
      .pipe(
        map(verContracts => {
          const res = verContracts.data.verifiedContracts.map(vContract => {
            return {
              address: vContract.id,
              iconUrl:
                "https://cloudflare-ipfs.com/ipfs" +
                  vContract.contractData?.iconUrl || "",
              decimals: vContract.contractData?.decimals || 18,
              name: vContract.contractData?.name,
              symbol: vContract.contractData?.symbol,
            };
          });
          console.log("client observer ===", res);
          return res;
        })
      )
      .subscribe();

    const tokenBal = await firstValueFrom(selectedTokenBalances$.pipe(skip(1)));
    // console.log(tokenBal)
  });
});
