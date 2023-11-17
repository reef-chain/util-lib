import { describe, it, beforeAll, expect } from "vitest";
import { initReefState } from "../../src/reefState/initReefState";
import { AVAILABLE_NETWORKS } from "../../src/network";
import { firstValueFrom, skipWhile } from "rxjs";
import { selectedTransactionHistory_status$ } from "../../src/reefState/tokenState.rx";
import { FeedbackStatusCode } from "../../src/reefState/model/statusDataObject";

describe("should test transferHistory observable", () => {
  let res;
  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
            meta: { source: "reef" },
          },
        ],
        injectedSigner: {},
      },
    });
    res = await firstValueFrom(
      selectedTransactionHistory_status$.pipe(
        skipWhile(
          value =>
            !value.hasStatus(FeedbackStatusCode.COMPLETE_DATA) ||
            value.getStatusList().length != 1
        )
      )
    );
  });
  it("should check if tx belongs to addr", async () => {
    let accountAddress = "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP";
    let isValidTx = false;
    if (accountAddress == res.data[0].to || accountAddress == res.data[0].from)
      isValidTx = true;
    expect(isValidTx).toEqual(true);
  });
  it("should check if url is valid", async () => {
    const url = res.data[0].url;
    expect(url.split(":")[0]).toEqual("https");

    const isValidUrl = (url: string) =>
      url == "testnet.reefscan.info" || url == "reefscan.info";
    const splitted_url = url.split("/");

    //url structure
    // [protocol]/[subdomain?][domain]/transfer/[no]/[no]/[no]

    expect(isValidUrl(splitted_url[2])).toEqual(true);
    expect(splitted_url[3]).toEqual("transfer");
  });
  it("should check last val is no.", () => {
    expect(res.data[0].url.split("/").length).toEqual(7);
  });
});
