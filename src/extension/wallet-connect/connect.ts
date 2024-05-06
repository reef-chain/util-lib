import Client from "@walletconnect/sign-client";
import { CoreTypes, SessionTypes } from "@walletconnect/types";
import { Web3Modal } from "@web3modal/standalone";
import { getAppMetadata } from "@walletconnect/utils";

import { getRequiredNamespaces } from "./utils";
import { logoSvgUrl } from "../../utils/logoSvgUrl";

export const WC_PROJECT_ID = "b20768c469f63321e52923a168155240";
const WC_RELAY_URL = "wss://relay.walletconnect.com";
const WC_LOGGER = "error";

const initWcClient = async (metadata?: CoreTypes.Metadata): Promise<Client> => {
  return await Client.init({
    logger: WC_LOGGER,
    relayUrl: WC_RELAY_URL,
    projectId: WC_PROJECT_ID,
    metadata: metadata || getAppMetadata(),
  });
};

const web3Modal = new Web3Modal({
  projectId: WC_PROJECT_ID,
  walletConnectVersion: 2,
  enableExplorer: false,
  explorerRecommendedWalletIds: "NONE",
  themeMode: "light",
  themeVariables: {
    "--w3m-accent-color": "#a93185",
    "--w3m-accent-fill-color": "#5d3bad",
    "--w3m-background-color": "#a93185",
    "--w3m-logo-image-url": logoSvgUrl,
  },
});

export interface WcConnection {
  client: Client;
  session: SessionTypes.Struct;
}

export const connectWc = async (
  metadata?: CoreTypes.Metadata
): Promise<WcConnection | undefined> => {
  try {
    const client = await initWcClient(metadata);

    const { uri, approval } = await client.connect({
      requiredNamespaces: getRequiredNamespaces(),
    });

    if (uri) {
      web3Modal.openModal({ uri });
    } else {
      throw new Error("No uri found");
    }

    const session = await approval();
    web3Modal.closeModal();
    return { client, session };
  } catch (error) {
    console.error("Error connecting WalletConnect:", error);
    web3Modal.closeModal();
    return undefined;
  }
};
