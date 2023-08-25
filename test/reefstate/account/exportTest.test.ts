import { describe, it, expect } from "vitest";
import { ACTIVE_NETWORK_LS_KEY } from "../../../src/reefState/networkState";
import * as reefState from "../../../src/reefState/index";

describe("export test", () => {
  it("should return reef-app-active-network ", () => {
    expect(ACTIVE_NETWORK_LS_KEY).toEqual("reef-app-active-network");
  });
  it("should return reef-app-active-network from reefState ", () => {
    expect(reefState.ACTIVE_NETWORK_LS_KEY).toEqual("reef-app-active-network");
  });
});
