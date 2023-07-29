import { Network } from "../network/network";
import { map, ReplaySubject, shareReplay } from "rxjs";
import { AxiosInstance } from "axios";
import { selectedNetwork$ } from "../reefState/networkState";

export const getGQLUrls = (
  network: Network
): { ws: string; http: string } | undefined => {
  if (!network.graphqlUrl) {
    return undefined;
  }
  const ws = network.graphqlUrl.startsWith("http")
    ? network.graphqlUrl.replace("http", "ws")
    : network.graphqlUrl;
  const http = network.graphqlUrl.startsWith("ws")
    ? network.graphqlUrl.replace("ws", "http")
    : network.graphqlUrl;
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
