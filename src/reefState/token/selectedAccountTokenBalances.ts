// TODO replace with our own from lib and remove
import {
  REEF_ADDRESS,
  REEF_TOKEN,
  Token,
  TokenBalance,
} from "../../token/tokenModel";
import { BigNumber } from "ethers";
import {
  catchError,
  expand,
  from,
  map,
  mergeMap,
  mergeScan,
  Observable,
  of,
  reduce,
  shareReplay,
  startWith,
  take,
  takeWhile,
} from "rxjs";
import {
  collectFeedbackDMStatus,
  FeedbackStatusCode,
  isFeedbackDM,
  StatusDataObject,
  toFeedbackDM,
} from "../model/statusDataObject";
import { ReefAccount } from "../../account/accountModel";
import { sortReefTokenFirst, toPlainString } from "./tokenUtil";
import { getIconUrl } from "../../token/getIconUrl";
import {
  getAllTokensQuery,
  getSignerTokensQuery,
} from "../../graphql/signerTokens.gql";
import { AxiosInstance } from "axios";
import { queryGql$ } from "../../graphql/gqlUtil";
import { getContractDataQuery } from "../../graphql/contractData.gql";
import { reefTokenWithAmount } from "../../token/tokenUtil";
import { toIpfsProviderUrl } from "../../token/nftUtil";

// eslint-disable-next-line camelcase
export const fetchTokensData = (
  httpClient: any,
  missingCacheContractDataAddresses: string[]
): Observable<Token[]> => {
  if (!missingCacheContractDataAddresses.length) {
    return of([]);
  }

  const distinctAddr = missingCacheContractDataAddresses.reduce(
    (distinctAddrList: string[], curr: string) => {
      if (distinctAddrList.indexOf(curr) < 0) {
        distinctAddrList.push(curr);
      }
      return distinctAddrList;
    },
    []
  );

  return queryGql$(httpClient, getContractDataQuery(distinctAddr)).pipe(
    take(1),
    map((verContracts: any) => {
      return verContracts.data.verifiedContracts.map(
        // eslint-disable-next-line camelcase
        (vContract: { id: string; contractData: any }) => {
          return {
            address: vContract.id,
            iconUrl: vContract.contractData?.iconUrl,
            decimals: vContract.contractData?.decimals || 18,
            name: vContract.contractData?.name,
            symbol: vContract.contractData?.symbol,
            balance: BigNumber.from(0),
          } as Token;
        }
      );
    }),
    shareReplay(1),
    catchError(err => {
      console.log("fetchTokensData ERROR=", err);
      return of([]);
    })
  );
};

// eslint-disable-next-line camelcase
function toTokensWithContractDataFn(tokenBalances: TokenBalance[]): (
  tkns: Token[]
) => {
  tokens: StatusDataObject<Token | TokenBalance>[];
  contractData: Token[];
} {
  return (cData: Token[]) => {
    const tokens: StatusDataObject<Token | TokenBalance>[] = tokenBalances.map(
      tBalance => {
        const cDataTkn = cData.find(
          cd => cd.address === tBalance.address
        ) as Token;
        return cDataTkn
          ? toFeedbackDM(
              {
                ...cDataTkn,
                balance: BigNumber.from(toPlainString(tBalance.balance)),
              } as Token,
              FeedbackStatusCode.COMPLETE_DATA,
              "Contract data set"
            )
          : toFeedbackDM(
              { ...tBalance } as TokenBalance,
              FeedbackStatusCode.PARTIAL_DATA_LOADING,
              "Loading contract data"
            );
      }
    );

    return { tokens, contractData: cData };
  };
}

const tokenBalancesWithContractDataCache_sdo =
  (httpClient: any) =>
  (
    state: {
      tokens: StatusDataObject<Token | TokenBalance>[];
      contractData: Token[];
    },
    // eslint-disable-next-line camelcase
    tokenBalances: TokenBalance[]
  ): Observable<{
    tokens: StatusDataObject<Token | TokenBalance>[];
    contractData: Token[];
  }> => {
    const missingCacheContractDataAddresses = tokenBalances
      .filter(tb => !state.contractData.some(cd => cd.address === tb.address))
      .map(tb => tb.address);

    return fetchTokensData(httpClient, missingCacheContractDataAddresses).pipe(
      mergeMap(newTokens =>
        of(
          newTokens ? newTokens.concat(state.contractData) : state.contractData
        )
      ),
      mergeMap((tokenContractData: Token[]) => {
        return of(
          toTokensWithContractDataFn(tokenBalances)(tokenContractData)
        ).pipe(
          startWith(
            toTokensWithContractDataFn(tokenBalances)(state.contractData)
          )
        );
      }),
      catchError(err => {
        console.log(
          "tokenBalancesWithContractDataCache_sdo ERROR=",
          err.message
        );
        return of({ tokens: [], contractData: state.contractData });
      }),
      shareReplay(1)
    );
  };

const resolveEmptyIconUrls = (
  tokens: StatusDataObject<Token | TokenBalance>[]
) => {
  return tokens.map(tkn => {
    tkn.data.iconUrl = tkn.data.iconUrl
      ? toIpfsProviderUrl(tkn.data.iconUrl) ?? tkn.data.iconUrl
      : getIconUrl(tkn.data.address);

    return tkn;
  });
};

// adding shareReplay is messing up TypeScriptValidateTypes
export const replaceReefBalanceFromAccount = (
  tokens: StatusDataObject<StatusDataObject<Token | TokenBalance>[]>,
  accountBalance: BigNumber | null | undefined
) => {
  if (!accountBalance || accountBalance.lte(BigNumber.from("0"))) {
    return tokens;
  }
  const reefTkn = tokens.data.find(t => t.data.address === REEF_ADDRESS);
  if (reefTkn) {
    reefTkn.data.balance = accountBalance;
  }
  return tokens;
};

// noinspection TypeScriptValidateTypes
export const loadAccountTokens_sdo = ([
  httpClient,
  signer,
  forceReloadj,
  tokensUpdated,
]: [AxiosInstance, StatusDataObject<ReefAccount>, any, any]): Observable<
  StatusDataObject<StatusDataObject<Token | TokenBalance>[]>
> => {
  // TODO check the status of signer - could be loading?
  return !signer
    ? of(
        toFeedbackDM(
          [],
          FeedbackStatusCode.MISSING_INPUT_VALUES,
          "Signer not set"
        )
      )
    : // can also be httpClient subscription
      queryGql$(httpClient, getSignerTokensQuery(signer.data.address)).pipe(
        map((res: any): TokenBalance[] => {
          if (res?.data?.tokenHolders) {
            return res.data.tokenHolders.map(
              th =>
                ({
                  address: th.token.id,
                  balance: th.balance,
                } as TokenBalance)
            );
          }

          if (isFeedbackDM(res)) {
            return res;
          }
          throw new Error("No result from SIGNER_TOKENS_GQL");
        }),
        // eslint-disable-next-line camelcase
        mergeScan(tokenBalancesWithContractDataCache_sdo(httpClient), {
          tokens: [],
          contractData: [reefTokenWithAmount()],
        }),
        map((tokens_cd: { tokens: StatusDataObject<Token | TokenBalance>[] }) =>
          resolveEmptyIconUrls(tokens_cd.tokens)
        ),
        map(sortReefTokenFirst),
        map((tkns: StatusDataObject<Token | TokenBalance>[]) => {
          return toFeedbackDM(tkns, collectFeedbackDMStatus(tkns));
        }),
        catchError(err => {
          console.log("loadAccountTokens 1 ERROR=", err);
          return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
        }),
        shareReplay(1)
      );
};

export const loadAllTokens_sdo = ([
  httpClient,
  signer,
  forceReloadj,
  tokensUpdated,
]: [
  AxiosInstance,
  StatusDataObject<ReefAccount>,
  any,
  any
]): Observable<any> => {
  // TODO check the status of signer - could be loading?
  return !signer
    ? of(
        toFeedbackDM(
          [],
          FeedbackStatusCode.MISSING_INPUT_VALUES,
          "Signer not set"
        )
      )
    : // can also be httpClient subscription
      queryGql$(httpClient, getAllTokensQuery(0)).pipe(
        map((res: any): TokenBalance[] => {
          if (res?.data?.tokenHolders) {
            return res.data.tokenHolders.map(
              th =>
                ({
                  address: th.token.id,
                  balance: th.balance,
                } as TokenBalance)
            );
          }

          if (isFeedbackDM(res)) {
            return res;
          }
          throw new Error("No result from SIGNER_TOKENS_GQL");
        }),
        // eslint-disable-next-line camelcase
        mergeScan(tokenBalancesWithContractDataCache_sdo(httpClient), {
          tokens: [],
          contractData: [reefTokenWithAmount()],
        }),
        map((tokens_cd: { tokens: StatusDataObject<Token | TokenBalance>[] }) =>
          resolveEmptyIconUrls(tokens_cd.tokens)
        ),
        map(sortReefTokenFirst),
        map((tkns: StatusDataObject<Token | TokenBalance>[]) => {
          return toFeedbackDM(tkns, collectFeedbackDMStatus(tkns));
        }),
        catchError(err => {
          console.log("loadAccountTokens 1 ERROR=", err);
          return of(toFeedbackDM([], FeedbackStatusCode.ERROR, err.message));
        }),
        shareReplay(1)
      );
};

export const setReefBalanceFromAccount = ([tokens, selSigner]: [
  StatusDataObject<StatusDataObject<Token | TokenBalance>[]>,
  StatusDataObject<ReefAccount> | undefined
]): StatusDataObject<StatusDataObject<Token | TokenBalance>[]> => {
  if (!selSigner) {
    return toFeedbackDM([], FeedbackStatusCode.MISSING_INPUT_VALUES);
  }
  const signerTkns = tokens ? tokens.data : [];
  if (selSigner.data.balance) {
    const reefT = signerTkns.find(t => t.data.address === REEF_ADDRESS);
    if (reefT) {
      reefT.data.balance = selSigner.data.balance;
    } else {
      signerTkns.unshift(
        toFeedbackDM(
          {
            ...REEF_TOKEN,
            balance: selSigner.data.balance,
          },
          FeedbackStatusCode.COMPLETE_DATA
        )
      );
    }
  }
  return toFeedbackDM(signerTkns, tokens.getStatusList());
};
