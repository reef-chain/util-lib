import { map, merge, Observable, shareReplay, filter } from "rxjs";
import axios, { AxiosInstance } from "axios";
import { graphQlUrls$ } from "./gqlUtil";

export const httpClientInstance$: Observable<AxiosInstance> = merge(
  graphQlUrls$
).pipe(
  map(urls =>
    urls
      ? axios.create({
          baseURL: urls.http,
        })
      : undefined
  ),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  filter(v => !!v),
  shareReplay(1)
) as Observable<AxiosInstance>;
