import SnapInjected from "./Injected";
import { SNAP_ID } from ".";
import { Web3Window } from "./types";

const sendMessage = async (message: string, request?: any): Promise<any> => {
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

export async function enableSnap(_origin: string): Promise<SnapInjected> {
  return new SnapInjected(sendMessage);
}
