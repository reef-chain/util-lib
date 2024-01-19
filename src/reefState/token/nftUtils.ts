import {
  catchError,
  combineLatest,
  from,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { BigNumber } from "ethers";
import { ContractType, NFT } from "../../token/tokenModel";
import { IpfsUrlResolverFn, resolveNftImageLinks$ } from "../../token/nftUtil";
import { ReefAccount } from "../../account/accountModel";
import {
  collectFeedbackDMStatus,
  FeedbackStatusCode,
  isFeedbackDM,
  StatusDataObject,
  toFeedbackDM,
} from "../model/statusDataObject";
import { getSignerNftsQuery } from "../../graphql/signerNfts.gql";
import { getReefAccountSigner } from "../../account/accountSignerUtils";
import { Provider } from "@reef-defi/evm-provider";
import { instantProvider$ } from "../providerState";
import { AxiosInstance } from "axios";
import { queryGql$ } from "../../graphql/gqlUtil";

export let _NFT_IPFS_RESOLVER_FN: IpfsUrlResolverFn | undefined;
export const setNftIpfsResolverFn = (val?: IpfsUrlResolverFn) => {
  _NFT_IPFS_RESOLVER_FN = val;
};

export interface VerifiedNft {
  token: {
    id: string;
    type: ContractType.ERC1155 | ContractType.ERC721;
  };
  balance: string;
  nftId: string;
}

const parseTokenHolderArray = (resArr: VerifiedNft[]): NFT[] =>
  resArr.map(
    ({ balance, nftId, token: { id: address, type: contractType } }) => {
      return {
        contractType,
        balance: BigNumber.from(balance),
        nftId,
        symbol: "",
        decimals: 0,
        address,
        iconUrl: "",
        name: "",
      } as NFT;
    }
  );

export const loadSignerNfts = ([
  httpClient,
  signer,
  forceReload,
  nftBalanceUpdated,
]: [
  AxiosInstance,
  StatusDataObject<ReefAccount>,
  boolean,
  boolean
]): Observable<StatusDataObject<StatusDataObject<NFT>[]>> =>
  !signer || !httpClient
    ? of(
        toFeedbackDM(
          [],
          FeedbackStatusCode.MISSING_INPUT_VALUES,
          "Signer not set"
        )
      )
    : /*zenToRx(
        httpClient.subscribe({
          query: SIGNER_NFTS_GQL,
          variables: {
            accountId: (signer.data as ReefAccount).address,
          },
          fetchPolicy: "network-only",
        })
      )*/
      queryGql$(httpClient, getSignerNftsQuery(signer.data.address)).pipe(
        map((res: any) => {
          if (res?.data?.tokenHolders) {
            return res.data.tokenHolders as VerifiedNft[];
          }

          if (isFeedbackDM(res)) {
            return res;
          }
          throw new Error("Could not load data.");
        }),
        map((res: VerifiedNft[]) => parseTokenHolderArray(res)),
        // TODO handle SDO- map((res: VerifiedNft[]|FeedbackDataModel<NFT[]>) => isFeedbackDM(res)?res:parseTokenHolderArray(res)),
        switchMap((nftArr: NFT[]) =>
          combineLatest([of(nftArr), instantProvider$]).pipe(
            switchMap(
              (
                nftsAndProvider: [(NFT | null)[] | NFT[], Provider | undefined]
              ) => {
                const [nfts, provider] = nftsAndProvider;

                if (!provider) {
                  return of(
                    nfts.map(nft =>
                      toFeedbackDM(
                        nft,
                        FeedbackStatusCode.PARTIAL_DATA_LOADING,
                        "Provider not connected."
                      )
                    )
                  );
                }
                const sig$ = from(getReefAccountSigner(signer.data, provider));

                return sig$.pipe(
                  switchMap(sig => {
                    if (!sig) {
                      return of(
                        nfts.map(nft =>
                          toFeedbackDM(
                            nft,
                            FeedbackStatusCode.MISSING_INPUT_VALUES,
                            "Could not create Signer."
                          )
                        )
                      );
                    }
                    return resolveNftImageLinks$(
                      nfts,
                      sig,
                      _NFT_IPFS_RESOLVER_FN
                    );
                  })
                );
              }
            ),
            map(
              (
                feedbackNfts: StatusDataObject<NFT>[]
              ): StatusDataObject<StatusDataObject<NFT>[]> => {
                const codes = collectFeedbackDMStatus(feedbackNfts);
                let message = codes.some(
                  c => c === FeedbackStatusCode.PARTIAL_DATA_LOADING
                )
                  ? "Resolving nft urls."
                  : "";
                if (!feedbackNfts.length) {
                  message = "No nfts found";
                  codes.push(FeedbackStatusCode.COMPLETE_DATA);
                }
                return toFeedbackDM(feedbackNfts, codes, message);
              }
            )
          )
        ),
        catchError(err =>
          of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message))
        )
      );
