import { Provider } from "@reef-defi/evm-provider";
import { getSpecTypes } from "@polkadot/types-known";
import { Metadata, TypeRegistry } from "@polkadot/types";
import type { AnyJson } from "@polkadot/types/types";
import type { Call } from "@polkadot/types/interfaces";
import { base64Decode, base64Encode } from "@reef-defi/util-crypto";
import { ethers } from "ethers";
import { Fragment, JsonFragment } from "@ethersproject/abi";
import { REEF_ADDRESS } from "../token";
import {
  catchError,
  firstValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  take,
} from "rxjs";
import { getContractAbiQuery } from "../graphql/contractData.gql";
import { ERC20 } from "../token/abi/ERC20";
import { httpClientInstance$ } from "../graphql/httpClient";

import { queryGql$ } from "../graphql/gqlUtil";

export interface DecodedMethodData {
  methodName: string;
  args: string[];
  info: string;
  vm: {
    evm?: {
      contractAddress: string;
      decodedData: any;
    };
  };
}

export async function getContractAbi(contractAddress: string): Promise<any[]> {
  if (contractAddress === REEF_ADDRESS) {
    return Promise.resolve(ERC20 as any[]);
  }
  return firstValueFrom(
    httpClientInstance$.pipe(
      mergeMap(httpClient => fetchContractAbi$(httpClient, contractAddress)),
      map(res => {
        if (res[0] && res[0]["REEFERC20"]) {
          res = res[0];
        }
        let abiArr: any[] = [];
        res.forEach(ercDefinitionsObj => {
          Object.keys(ercDefinitionsObj).forEach(ercKey => {
            const ercDefinitionsObjAbi = ercDefinitionsObj[ercKey];
            abiArr = abiArr.concat(ercDefinitionsObjAbi);
          });
        });
        return abiArr;
      }),
      take(1)
    )
  );
}

function fetchContractAbi$(
  httpClient: any,
  contractAddress: string
): Observable<any | null> {
  /*return zenToRx(
    httpClient.subscribe({
      query: CONTRACT_ABI_GQL,
      variables: { address: contractAddress },
      fetchPolicy: "network-only",
    })
  )*/
  return queryGql$(httpClient, getContractAbiQuery(contractAddress)).pipe(
    take(1),
    map((verContracts: any) =>
      verContracts.data.verifiedContracts.map(
        // eslint-disable-next-line camelcase
        (vContract: { id: string; compiledData: any }) => vContract.compiledData
      )
    ),
    catchError(err => {
      console.log("getContractAbi ERROR=", err);
      return of(null);
    })
  );
}

export async function decodePayloadMethod(
  provider: Provider,
  methodDataEncoded: string,
  abi?: string | readonly (string | Fragment | JsonFragment)[],
  sentValue = "0",
  types?: any
): Promise<DecodedMethodData | null> {
  const api = provider.api;
  await api.isReady;
  if (!types) {
    types = getSpecTypes(
      api.registry,
      api.runtimeChain.toString(),
      api.runtimeVersion.specName,
      api.runtimeVersion.specVersion
    ) as unknown as Record<string, string>;
  }

  let args: any | null = null;
  let method: Call | null = null;

  try {
    const registry = new TypeRegistry();
    registry.register(types);
    registry.setChainProperties(
      // @ts-ignore
      registry.createType("ChainProperties", {
        ss58Format: 42,
        tokenDecimals: 18,
        tokenSymbol: "REEF",
      })
    );
    const metaCalls = base64Encode(api.runtimeMetadata.asCallsOnly.toU8a());
    // @ts-ignore
    const metadata = new Metadata(registry, base64Decode(metaCalls || ""));
    registry.setMetadata(metadata, undefined, undefined);

    method = registry.createType("Call", methodDataEncoded);
    args = (method.toHuman() as { args: AnyJson }).args;
  } catch (error) {
    console.log("decodeMethod: ERROR decoding method");
    return null;
  }

  const info = method?.meta
    ? method.meta.docs.map(d => d.toString().trim()).join(" ")
    : "";
  const methodParams = method?.meta
    ? `(${method.meta.args.map(({ name }) => name).join(", ")})`
    : "";
  const methodName = method
    ? `${method.section}.${method.method}${methodParams}`
    : "";

  const decodedResponse = {
    methodName,
    args,
    info,
    vm: {},
  };

  const isEvm = methodName.startsWith("evm.call");

  if (isEvm) {
    const contractAddress = args[0];
    let decodedData;
    if (!abi || !abi.length) {
      abi = await getContractAbi(contractAddress);
    }

    if (abi && abi.length && !!args) {
      const methodArgs = args[1];
      try {
        console.log("ABI can have duplicate member warnings");
        const iface = new ethers.utils.Interface(abi);
        decodedData = iface.parseTransaction({
          data: methodArgs,
          value: sentValue,
        });
      } catch (e) {
        /* empty */
      }
    }
    decodedResponse.vm["evm"] = {
      contractAddress,
      decodedData,
    };
  }

  return decodedResponse;
}
