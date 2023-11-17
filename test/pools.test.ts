import { beforeAll, describe, it } from "vitest";
import { FeedbackStatusCode, initReefState } from "../src/reefState";
import { firstValueFrom, skipWhile, tap } from "rxjs";
import { AVAILABLE_NETWORKS } from "../src/network";
import { availableReefPools_status$ } from "../src/reefState/tokenState.rx";

describe("pools", () => {
  const signingKey = {};

  beforeAll(async () => {
    initReefState({
      network: AVAILABLE_NETWORKS.testnet,
      jsonAccounts: {
        accounts: [
          {
            address: "5EnY9eFwEDcEJ62dJWrTXhTucJ4pzGym4WZ2xcDKiT3eJecP",
            isSelected: true,
          },
        ],
        injectedSigner: signingKey,
      },
    });
  });

  it.todo("should return available REEF pools", async () => {
    const res = await firstValueFrom(
      availableReefPools_status$.pipe(
        tap(v => console.log("VVV", v)),
        skipWhile(
          value =>
            !value.hasStatus(FeedbackStatusCode.COMPLETE_DATA) ||
            value.getStatusList().length != 1
        )
      )
    );
    console.log("pppp", res);
  });
});
