import Client from "@walletconnect/sign-client";
import { CoreTypes, SessionTypes } from "@walletconnect/types";
import { getAppMetadata } from "@walletconnect/utils";

export const WC_PROJECT_ID = "b20768c469f63321e52923a168155240";
const WC_RELAY_URL = "wss://relay.walletconnect.com";
const WC_LOGGER = "error";

export const initWcClient = async (
  metadata?: CoreTypes.Metadata
): Promise<Client> => {
  return await Client.init({
    logger: WC_LOGGER,
    relayUrl: WC_RELAY_URL,
    projectId: WC_PROJECT_ID,
    metadata: metadata || getAppMetadata(),
  });
};

export interface WcConnection {
  client: Client;
  session: SessionTypes.Struct;
}
