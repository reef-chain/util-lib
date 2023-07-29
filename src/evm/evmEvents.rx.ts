import { gql, SubscriptionOptions } from "@apollo/client";
import { utils } from "ethers";
import { map, Observable, of, shareReplay, switchMap } from "rxjs";
import { getLatestBlockContractEvents$ } from "../network";
import { httpClientInstance$ } from "../graphql/httpClient";
import { AxiosInstance } from "axios";
import { filter } from "rxjs/operators";
import { queryGql$ } from "../graphql/gqlUtil";

const getGqlContractEventsQuery = (
  contractAddress: string,
  methodSignature?: string | null,
  fromBlockId?: number,
  toBlockId?: number
) => {
  const EVM_EVENT_QUERY = `
    query evmEvent(
      $address: String_comparison_exp!
      $blockId: bigint_comparison_exp!
      $topic0: String_comparison_exp
    ) {
      evm_event(
        order_by: [
          { block_id: desc }
          { extrinsic_index: desc }
          { event_index: desc }
        ]
        where: {
          _and: [
            { contract_address: $address }
            { topic_0: $topic0 }
            { method: { _eq: "Log" } }
            { block_id: $blockId }
          ]
        }
      ) {
        contract_address
        data_parsed
        data_raw
        topic_0
        topic_1
        topic_2
        topic_3
        block_id
        extrinsic_index
        event_index
      }
    }
  `;
  return {
    query: EVM_EVENT_QUERY,
    variables: {
      address: { _eq: contractAddress },
      topic0: methodSignature
        ? { _eq: utils.keccak256(utils.toUtf8Bytes(methodSignature)) }
        : {},
      blockId: toBlockId
        ? { _gte: fromBlockId, _lte: toBlockId }
        : { _eq: fromBlockId },
    },
  };
};

const getGqlLastFinalizedBlock = (): SubscriptionOptions => {
  const FINALISED_BLOCK_GQL = gql`
    subscription finalisedBlock {
      block(
        order_by: { id: desc }
        limit: 1
        where: { finalized: { _eq: true } }
      ) {
        id
      }
    }
  `;
  return {
    query: FINALISED_BLOCK_GQL,
    variables: {},
    fetchPolicy: "network-only",
  };
};

export function getEvmEvents$(
  contractAddress: string,
  methodSignature?: string,
  fromBlockId?: number,
  toBlockId?: number
): Observable<{
  fromBlockId: number;
  toBlockId: number;
  evmEvents: any[];
} | null> {
  if (!contractAddress) {
    console.warn("getEvmEvents$ expects contractAddress");
    return of(null);
  }
  if (!fromBlockId) {
    return httpClientInstance$.pipe(
      switchMap(
        (httpClient: AxiosInstance) =>
          getLatestBlockContractEvents$([contractAddress]).pipe(
            map(latestBlock => ({
              fromBlockId: latestBlock.blockHeight,
              toBlockId: undefined,
            })),
            filter(lb => (toBlockId ? lb.fromBlockId <= toBlockId : true)),
            switchMap(
              (res: { fromBlockId: number; toBlockId: number | undefined }) =>
                queryGql$(
                  httpClient,
                  getGqlContractEventsQuery(
                    contractAddress,
                    methodSignature,
                    res.fromBlockId,
                    res.toBlockId
                  )
                ).pipe(
                  map(events => ({
                    fromBlockId: res.fromBlockId,
                    toBlockId: res.toBlockId || res.fromBlockId,
                    evmEvents: events.data.evm_event,
                  }))
                )
            )
          ) as Observable<any>
      ),
      shareReplay(1)
    );
  }

  return httpClientInstance$.pipe(
    switchMap((httpClient: AxiosInstance) =>
      queryGql$(
        httpClient,
        getGqlContractEventsQuery(
          contractAddress,
          methodSignature,
          fromBlockId,
          toBlockId
        )
      )
    ),
    map(events => ({
      fromBlockId,
      toBlockId: toBlockId || fromBlockId,
      evmEvents: events.data.evm_event,
    })),
    shareReplay(1)
  );
}
