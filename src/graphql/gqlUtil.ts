import { Network } from "../network/network";
import { from, map, shareReplay } from "rxjs";
import { AxiosInstance } from "axios";
import { selectedNetwork$ } from "../reefState/networkState";

export const getGQLUrls = (
  network: Network
): { ws: string; http: string } | undefined => {
  if (!network.graphqlExplorerUrl) {
    return undefined;
  }
  const ws = network.graphqlExplorerUrl.startsWith("http")
    ? network.graphqlExplorerUrl.replace("http", "ws")
    : network.graphqlExplorerUrl;
  const http = network.graphqlExplorerUrl.startsWith("ws")
    ? network.graphqlExplorerUrl.replace("ws", "http")
    : network.graphqlExplorerUrl;
  return { ws, http };
};
export const graphqlRequest = (
  httpClient: AxiosInstance,
  queryObj: { query: string; variables: any }
) => {
  const graphql = JSON.stringify(queryObj);

  return httpClient.post("", graphql, {
    headers: { "Content-Type": "application/json" },
  });
};
/*export const graphQlUrlsSubj = new ReplaySubject<{ ws: string; http: string }>(
  1
);*/
/*export const setGraphQlUrls = (urls: { ws: string; http: string }): void => {
  graphQlUrlsSubj.next(urls);
};*/

export const graphQlUrls$ = selectedNetwork$.pipe(
  map(getGQLUrls),
  shareReplay(1)
);
export const queryGql$ = (
  client: AxiosInstance,
  queryObj: { query: string; variables: any }
) =>
  from(graphqlRequest(client as AxiosInstance, queryObj).then(res => res.data));
