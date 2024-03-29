import {
  catchError,
  combineLatest,
  forkJoin,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from "rxjs";
import { Contract } from "ethers";
import axios from "axios";
import { Signer } from "@reef-chain/evm-provider";
import { NFT, NFTMetadata } from "./tokenModel";
import {
  FeedbackStatusCode,
  StatusDataObject,
  toFeedbackDM,
} from "../reefState/model/statusDataObject";
import { getContractTypeAbi } from "./tokenUtil";
import { Signer as EthersSigner } from "@ethersproject/abstract-signer";

import { IpfsUrlResolverFn } from "../reefState/ipfsUrlResolverFn";

const extractIpfsHash = (ipfsUri: string): string | null => {
  const ipfsProtocol = "ipfs://";
  if (ipfsUri?.startsWith(ipfsProtocol)) {
    return ipfsUri.substring(ipfsProtocol.length);
  }
  return null;
};

export function getIpfsUrl(ipfsHash: string) {
  // return `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
  return `https://reef.infura-ipfs.io/ipfs/${ipfsHash}`;
}

export const toIpfsProviderUrl = (
  ipfsUriStr: string,
  ipfsUrlResolver?: IpfsUrlResolverFn
): string | null => {
  const ipfsHash = extractIpfsHash(ipfsUriStr);
  if (ipfsHash) {
    return !ipfsUrlResolver ? getIpfsUrl(ipfsHash) : ipfsUrlResolver(ipfsHash);
  }
  return null;
};

const resolveUriToUrl = (
  uri: string,
  nft: NFT,
  ipfsUrlResolver?: IpfsUrlResolverFn
): string => {
  const ipfsUrl = toIpfsProviderUrl(uri, ipfsUrlResolver);
  if (ipfsUrl) {
    return ipfsUrl;
  }

  const idPlaceholder = "{id}";
  if (nft.nftId != null && uri.indexOf(idPlaceholder) > -1) {
    let replaceValue = nft.nftId;
    try {
      replaceValue = parseInt(nft.nftId, 10).toString(16).padStart(64, "0");
    } catch (e) {
      /* empty */
    }
    return uri.replace(idPlaceholder, replaceValue);
  }
  return uri;
};

const resolveImageData = (
  metadata: NFTMetadata,
  nft: NFT,
  ipfsUrlResolver?: IpfsUrlResolverFn
): NFTMetadata => {
  const imageUriVal: string = metadata?.image
    ? metadata.image
    : metadata.toString();
  return {
    iconUrl: resolveUriToUrl(imageUriVal, nft, ipfsUrlResolver),
    name: metadata.name,
    mimetype: metadata.mimetype,
  };
};

export const getResolveNftPromise = async (
  nft: NFT | null,
  signer: Signer,
  ipfsUrlResolver?: IpfsUrlResolverFn
): Promise<NFT | null> => {
  if (!nft) {
    return Promise.resolve(null);
  }
  try {
    // throw new Error('Test234')
    const contractTypeAbi = getContractTypeAbi(nft.contractType);
    const contract = new Contract(
      nft.address,
      contractTypeAbi,
      signer as unknown as EthersSigner
    );
    const uriPromise = (contractTypeAbi as any).some(fn => fn.name === "uri")
      ? contract.uri(nft.nftId)
      : contract
          .tokenURI(nft.nftId)
          .catch(reason => console.log("error getting contract uri"));

    return await uriPromise
      .then(metadataUri => resolveUriToUrl(metadataUri, nft, ipfsUrlResolver))
      .then(axios.get)
      .then(jsonStr => resolveImageData(jsonStr.data, nft, ipfsUrlResolver))
      .then(nftUri => ({ ...nft, ...nftUri }));
  } catch (e: any) {
    console.log("ERROR getResolveNftPromise=", e);
    throw new Error(e.message);
  }
};

export const resolveNftImageLinks = (
  nfts: (NFT | null)[],
  signer: Signer,
  ipfsUrlResolver?: IpfsUrlResolverFn
): Observable<(NFT | null)[]> =>
  nfts?.length
    ? forkJoin(
        nfts.map(nft => getResolveNftPromise(nft, signer, ipfsUrlResolver))
      )
    : of([]);

export const resolveNftImageLinks$ = (
  nfts: (NFT | null)[] | NFT[],
  signer: Signer,
  ipfsUrlResolver?: IpfsUrlResolverFn
):
  | Observable<StatusDataObject<NFT | null>[]>
  | Observable<StatusDataObject<NFT>[]> => {
  if (!nfts || !nfts.length || !signer) {
    return of([]);
  }
  const resolveObsArr: Observable<StatusDataObject<NFT | null>>[] = nfts.map(
    (nft: NFT | null) =>
      of(nft).pipe(
        switchMap((nft: NFT | null) =>
          getResolveNftPromise(nft, signer, ipfsUrlResolver)
        ),
        map((resNft: NFT | null) =>
          toFeedbackDM(resNft, FeedbackStatusCode.COMPLETE_DATA, "Url resolved")
        ),
        catchError(err => {
          console.log("ERROR resolving nft img=", err);
          return of(
            toFeedbackDM(
              nft,
              FeedbackStatusCode.MISSING_INPUT_VALUES,
              "Url resolve error.",
              "iconUrl"
            )
          );
        }),
        startWith(
          toFeedbackDM(
            nft,
            FeedbackStatusCode.PARTIAL_DATA_LOADING,
            "Resolving url.",
            "iconUrl"
          )
        )
      )
  );
  return combineLatest(resolveObsArr);
  // .pipe(tap(v=>console.log('NFTS TAP', v)));
};
