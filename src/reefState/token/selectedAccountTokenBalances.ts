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
  from,
  map,
  mergeScan,
  Observable,
  of,
  shareReplay,
  startWith,
  take,
} from "rxjs";
import { CONTRACT_DATA_GQL, zenToRx } from "../../graphql";
import {
  collectFeedbackDMStatus,
  FeedbackStatusCode,
  isFeedbackDM,
  StatusDataObject,
  toFeedbackDM,
} from "../model/statusDataObject";
import { ApolloClient } from "@apollo/client";
import { ReefAccount } from "../../account/accountModel";
import { sortReefTokenFirst, toPlainString } from "./tokenUtil";
import { getIconUrl } from "../../token/getIconUrl";
import { reefTokenWithAmount } from "../../token";
import { getSignerTokensQuery } from "../../graphql/signerTokens.gql";
import axios, { AxiosInstance } from "axios";
import {graphqlRequest} from "../../graphql/gqlUtil";
import {httpClientInstance$} from "../../graphql/httpClient";

// eslint-disable-next-line camelcase
const fetchTokensData = (
  // apollo: ApolloClient<any>,
  apollo: any,
  missingCacheContractDataAddresses: string[]
): Observable<Token[]> => {
  const distinctAddr = missingCacheContractDataAddresses.reduce(
    (distinctAddrList: string[], curr: string) => {
      if (distinctAddrList.indexOf(curr) < 0) {
        distinctAddrList.push(curr);
      }
      return distinctAddrList;
    },
    []
  );
  return zenToRx(
    apollo.subscribe({
      query: CONTRACT_DATA_GQL,
      variables: { addresses: distinctAddr },
      fetchPolicy: "network-only",
    })
  ).pipe(
    take(1),
    map((verContracts: any) =>
      verContracts.data.verifiedContracts.map(
        // eslint-disable-next-line camelcase
        (vContract: { id: string; contractData: any }) => {
          return {
            address: vContract.id,
            iconUrl: "",
            decimals: vContract.contractData?.decimals || 18,
            name: vContract.contractData?.name,
            symbol: vContract.contractData?.symbol,
            balance: BigNumber.from(0),
          } as Token;
        }
      )
    ),
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
  (apollo: any) =>
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
    const contractData$ = missingCacheContractDataAddresses.length
      ? fetchTokensData(apollo, missingCacheContractDataAddresses).pipe(
          map(newTokens => {
            return newTokens
              ? newTokens.concat(state.contractData)
              : state.contractData;
          })
        )
      : of(state.contractData);

    return contractData$.pipe(
      map((tokenContractData: Token[]) =>
        toTokensWithContractDataFn(tokenBalances)(tokenContractData)
      ),
      startWith(toTokensWithContractDataFn(tokenBalances)(state.contractData)),
      // tap(v => console.log('tokenBalancesWithContractDataCache_sdo = ', v)),
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

/*let addReefTokenBalance = async (
    // eslint-disable-next-line camelcase
    tokenBalances: { token_address: string; balance: number }[],
) => {
    const reefTkn = reefTokenWithAmount();
    const reefTokenResult = tokenBalances.find(
        (tb) => tb.token_address === reefTkn.address,
    );

    const reefBalance = await getReefCoinBalance(
        signer.address,
        provider as Provider,
    );
    if (!reefTokenResult) {
        tokenBalances.push({
            token_address: reefTkn.address,
            balance: parseInt(utils.formatUnits(reefBalance, 'wei'), 10),
        });
        return Promise.resolve(tokenBalances);
    }

    reefTokenResult.balance = FixedNumber.fromValue(reefBalance).toUnsafeFloat();
    return Promise.resolve(tokenBalances);
};*/

const resolveEmptyIconUrls = (
  tokens: StatusDataObject<Token | TokenBalance>[]
) =>
  tokens.map(tkn => {
    if (tkn.data.iconUrl) {
      return tkn;
    } else {
      tkn.data.iconUrl = getIconUrl(tkn.data.address);
      return tkn;
    }
  });

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

export function queryGql$(
  client: AxiosInstance,
  queryObj: { query: string; variables: any }
) {
  /*if (client instanceof ApolloClient) {
    return zenToRx(
      client.subscribe({
        query: gql(queryObj.query),
        variables: queryObj.variables,
        fetchPolicy: "network-only",
        errorPolicy: "all",
      })
    );
  }*/
  // apollo: ApolloClient<any>,
  // signer: StatusDataObject<ReefAccount>
  /**/

  return from(
    graphqlRequest(client as AxiosInstance, queryObj).then(res => res.data)
  );
}

// noinspection TypeScriptValidateTypes
export const loadAccountTokens_sdo = ([apollo, signer, forceReload]: [
  ApolloClient<any>,
  StatusDataObject<ReefAccount>,
  any
]): Observable<StatusDataObject<StatusDataObject<Token | TokenBalance>[]>> => {
  // TODO move httpClient in place of apollo|httpClient so both could be used - remove apollo for now but so it's future compatible

  .. replace apollo with httpClientInstance$
  const httpClient = axios.create({
    baseURL: "https://squid.subsquid.io/reef-explorer-testnet/graphql",
  });

  // TODO check the status of signer - could be loading?
  return !signer
    ? of(
        toFeedbackDM(
          [],
          FeedbackStatusCode.MISSING_INPUT_VALUES,
          "Signer not set"
        )
      )
    : // can also be apollo subscription
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
        mergeScan(tokenBalancesWithContractDataCache_sdo(apollo), {
          tokens: [],
          contractData: [reefTokenWithAmount()],
        }),
        map((tokens_cd: { tokens: StatusDataObject<Token | TokenBalance>[] }) =>
          resolveEmptyIconUrls(tokens_cd.tokens)
        ),
        map(sortReefTokenFirst),
        map((tkns: StatusDataObject<Token | TokenBalance>[]) =>
          toFeedbackDM(tkns, collectFeedbackDMStatus(tkns))
        ),
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
