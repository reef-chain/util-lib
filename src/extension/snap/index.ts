import type { MetaMaskInpageProvider } from "@metamask/providers";

import type { GetSnapsResponse, Snap, Web3Window } from "./types";

export const SNAP_ID = "npm:@reef-chain/reef-snap";

export const getSnaps = async (
  provider?: MetaMaskInpageProvider
): Promise<GetSnapsResponse> =>
  (await (provider ?? (window as Window & Web3Window).ethereum).request({
    method: "wallet_getSnaps",
  })) as unknown as GetSnapsResponse;

export const connectSnap = async () => {
  await (window as Window & Web3Window).ethereum.request({
    method: "wallet_requestSnaps",
    params: {
      [SNAP_ID]: {},
    },
  });
};

export const getSnap = async (): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(snap => snap.id === SNAP_ID);
  } catch (error) {
    console.log("Failed to obtain installed snap", error);
    return undefined;
  }
};

export const sendToSnap = async (
  message: string,
  request?: any
): Promise<any> => {
  const res = await (window as Window & Web3Window).ethereum.request({
    method: "wallet_invokeSnap",
    params: {
      snapId: SNAP_ID,
      request: {
        method: message,
        params: request || {},
      },
    },
  });
  return res;
};
