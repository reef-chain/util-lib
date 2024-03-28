import {
  ContractType,
  NFT,
  Token,
  TokenTransfer,
} from "../../token/tokenModel";
import { ReefAccount } from "../../account/accountModel";
import { from, map, Observable, of, switchMap } from "rxjs";
import { resolveNftImageLinks } from "../../token/nftUtil";
import { BigNumber } from "ethers";
import { Network } from "../../network/network";
import { getSignerHistoryQuery } from "../../graphql/transferHistory.gql";
import { StatusDataObject } from "../model/statusDataObject";
import { getReefAccountSigner } from "../../account/accountSignerUtils";
import { Provider, Signer } from "@reef-chain/evm-provider";
import { toPlainString } from "./tokenUtil";
import { _NFT_IPFS_RESOLVER_FN } from "./nftUtils";
import { getIconUrl } from "../../token/getIconUrl";
import { getTransferUrl } from "../../token/transactionUtil";
import { AxiosInstance } from "axios";
import { queryGql$ } from "../../graphql/gqlUtil";

const resolveTransferHistoryNfts = (
  tokens: (Token | NFT)[],
  signer: Signer
): Observable<(Token | NFT)[]> => {
  const nftOrNull: (NFT | null)[] = tokens.map(tr =>
    "contractType" in tr &&
    (tr.contractType === ContractType.ERC1155 ||
      tr.contractType === ContractType.ERC721)
      ? tr
      : null
  );
  if (!nftOrNull.filter(v => !!v).length) {
    return of(tokens);
  }
  return of(nftOrNull).pipe(
    switchMap((nfts: (NFT | null)[]) =>
      resolveNftImageLinks(nfts, signer, _NFT_IPFS_RESOLVER_FN)
    ),
    map((nftOrNullResolved: (NFT | null)[]) => {
      const resolvedNftTransfers: (Token | NFT)[] = [];
      nftOrNullResolved.forEach((nftOrN, i) => {
        resolvedNftTransfers.push(nftOrN || tokens[i]);
      });
      return resolvedNftTransfers;
    })
  );
};

const toTransferToken = (transfer): Token | NFT =>
  transfer.token.type === ContractType.ERC20
    ? ({
        address: transfer.token.id,
        balance: BigNumber.from(toPlainString(transfer.amount)),
        name: transfer.token.contractData?.name || transfer.token.name,
        symbol: transfer.token.contractData?.symbol,
        decimals: transfer.token.contractData?.decimals || 18,
        iconUrl:
          transfer.token.contractData?.iconUrl || getIconUrl(transfer.token.id),
      } as Token)
    : ({
        address: transfer.token.id,
        balance: BigNumber.from(toPlainString(transfer.amount)),
        name: transfer.token.contractData?.name || transfer.token.name,
        symbol: "",
        decimals: 0,
        iconUrl: "",
        nftId: transfer.nftId,
        contractType: transfer.token.type,
      } as NFT);

const toTokenTransfers = (
  resTransferData: any[],
  signer: ReefAccount,
  network: Network
): TokenTransfer[] =>
  resTransferData.map(
    (transferData): TokenTransfer => ({
      from: transferData.from?.id,
      to: transferData.to.id,
      inbound:
        (!!signer.evmAddress &&
          transferData.to.evmAddress === signer.evmAddress) ||
        transferData.to.id === signer.address,
      timestamp: transferData.timestamp,
      token: toTransferToken(transferData),
      url: getTransferUrl(
        transferData.blockHeight,
        transferData.extrinsicIndex,
        transferData.eventIndex,
        network
      ),
      extrinsic: {
        blockId: transferData.blockHash,
        blockHeight: transferData.blockHeight,
        id: transferData.blockHeight + "-" + transferData.extrinsicIndex,
        index: transferData.extrinsicIndex,
        hash: transferData.blockHash,
        eventIndex: transferData.eventIndex,
      },
      type: transferData.type,
      reefswapAction: transferData.reefswapAction,
      success: transferData.success,
    })
  );

export const loadTransferHistory = ([
  httpClient,
  account,
  network,
  provider,
  forceReload,
  anyBalanceUpdate,
]: [
  AxiosInstance,
  StatusDataObject<ReefAccount>,
  Network,
  Provider,
  boolean,
  boolean
]): Observable<TokenTransfer[]> =>
  !account
    ? of([])
    : queryGql$(httpClient, getSignerHistoryQuery(account.data.address)).pipe(
        map((res: any) => {
          if (res?.data?.transfers) {
            return res.data.transfers;
          }
          throw new Error("Could not load data.");
        }),
        map((resData: any) => {
          return toTokenTransfers(resData, account.data, network);
        }),
        switchMap((transfers: TokenTransfer[]): Observable<TokenTransfer[]> => {
          const tokens = transfers.map((tr: TokenTransfer) => tr.token);
          const sig$ = from(getReefAccountSigner(account.data, provider));

          return from(sig$).pipe(
            switchMap((sig: Signer | undefined) =>
              sig ? resolveTransferHistoryNfts(tokens, sig) : []
            ),
            map((resolvedTokens: (Token | NFT)[]) =>
              resolvedTokens.map((resToken: Token | NFT, i) => ({
                ...transfers[i],
                token: resToken,
              }))
            )
          );
        })
      );
