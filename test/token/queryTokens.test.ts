import { describe, it } from "vitest";
import { loadAccountTokens_sdo } from "../../src/reefState/token/selectedAccountTokenBalances";
import axios from "axios";
import {
  FeedbackStatusCode,
  selectedTokenBalances_status$,
} from "../../src/reefState";
import { firstValueFrom, skipWhile } from "rxjs";

describe("get tokens", () => {
  it.only("should return tokens", async () => {
    const httpClient = axios.create({
      baseURL: "https://squid.subsquid.io/reef-explorer-testnet/graphql",
    });

    /*const res = await firstValueFrom(
      queryGql$(
        httpClient,
        getSignerTokensQuery("5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN")
      )
    );
    console.log("PPPPw1222", res.data);*/

    /*const reee = await firstValueFrom(
      loadAccountTokens_sdo([
        httpClient,
        {
          data: { address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN" },
        } as any,
        false,
      ])
    );
console.log('RRRRR', reee.data.length)*/

    /*return new Promise(resolve => {
      let c=0
      loadAccountTokens_sdo([
        httpClient,
        {
          data: { address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN" },
        } as any,
        false,
      ]).subscribe(t=> {
          console.log('TTT222', t.getStatusList().length, ' c=',++c)
          // resolve()
        })
    });*/

    const reee = await firstValueFrom(
      loadAccountTokens_sdo([
        httpClient,
        {
          data: { address: "5G9f52Dx7bPPYqekh1beQsuvJkhePctWcZvPDDuhWSpDrojN" },
        } as any,
        false,
      ]).pipe(skipWhile(value => value.getStatusList().length > 1))
    );
    console.log("RRR", reee.getStatusList());

    // ... test selectedTokenBalances_status$
  }, 10000);
});
