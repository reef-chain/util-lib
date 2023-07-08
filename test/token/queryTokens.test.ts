import { describe, it } from "vitest";
import { firstValueFrom } from "rxjs";
import { getSignerTokensQuery } from "../../src/graphql/signerTokens.gql";
import {
  loadAccountTokens_sdo,
  queryGql$,
} from "../../src/reefState/token/selectedAccountTokenBalances";
import axios from "axios";

describe("get tokens", () => {
  it("should return tokens", async () => {
    const httpClient = axios.create({
      baseURL: "https://squid.subsquid.io/reef-explorer-testnet/graphql",
    });
    const res = await firstValueFrom(
      queryGql$(
        httpClient,
        getSignerTokensQuery("5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN")
      )
    );
    console.log("PPPP122", res.data);

    const reee = await firstValueFrom(
      loadAccountTokens_sdo([
        {} as any,
        {
          data: { address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN" },
        } as any,
        false,
      ])
    );
    console.log("Error getting tokens", reee);
  });
});
