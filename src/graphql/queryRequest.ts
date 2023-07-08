import axios, { AxiosInstance } from "axios";
import { from } from "rxjs";

export const graphqlRequest = (
  httpClient: AxiosInstance,
  queryObj: { query: string; variables: any }
) => {
  const graphql = JSON.stringify(queryObj);

  return httpClient.post("", graphql, {
    headers: { "Content-Type": "application/json" },
  });
};
