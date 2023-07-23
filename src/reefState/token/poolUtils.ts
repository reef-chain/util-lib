// TODO when network changes signer changes as well? this could make 2 requests unnecessary - check
import { getAvailablePoolsQuery } from "../../graphql/availablePools.gql";
import { REEF_ADDRESS } from "../../token/tokenModel";
import { Observable } from "rxjs";
import { queryGql$ } from "./selectedAccountTokenBalances";

export const loadAvailablePools = ([httpClient, provider]): Observable<any> =>
  /*zenToRx(
    apollo.subscribe({
      query: AVAILABLE_REEF_POOLS_GQL,
      variables: { hasTokenAddress: REEF_ADDRESS },
      fetchPolicy: "network-only",
    })
  )*/
  queryGql$(httpClient, getAvailablePoolsQuery(REEF_ADDRESS));

export const toAvailablePools = ({ data: { verified_pool: pools } }) =>
  pools.map(pool => ({
    token1: pool.token_1,
    token2: pool.token_2,
    decimals: pool.pool_decimal,
    reserve1: null,
    reserve2: null,
    poolAddress: pool.address,
    userPoolBalance: null,
    totalVolumeToken1: pool.volume_aggregate.aggregate.sum.amount_1,
    totalVolumeToken2: pool.volume_aggregate.aggregate.sum.amount_2,
    lastTimeframe: pool.volume_aggregate.aggregate.max.timeframe,
    totalSupply: pool.supply[0]?.total_supply,
  }));
