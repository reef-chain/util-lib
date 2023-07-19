import { map, merge, Observable, shareReplay } from "rxjs";
import axios, { AxiosInstance } from "axios";
import { graphQlUrlsSubj } from "./gqlUtil";

export const httpClientInstance$: Observable<AxiosInstance> = merge(
  graphQlUrlsSubj
).pipe(
  map(urls =>
    axios.create({
      baseURL: urls.http,
    })
  ),
  shareReplay(1)
);
