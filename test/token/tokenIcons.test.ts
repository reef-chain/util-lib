import { beforeAll, describe, it } from "vitest";
import { initReefState } from "../../src/reefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import axios from "axios";
import { getContractDataQuery } from "../../src/graphql/contractData.gql";

describe("graphql tests", () => {
  const accountId = "5HWEZvfy8uUsxqNTNuxrkMrDmAmkECzC2GCjcn2KLtKZuJaw";
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.mainnet,
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

  it("should fetch tokens contract data", async () => {
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

    const graphql = JSON.stringify(getContractDataQuery(distinctAddr));
    const response = await axios.post(
      "https://squid.subsquid.io/reef-explorer-testnet/graphql",
      graphql,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log(response.data.data);
  });
});
