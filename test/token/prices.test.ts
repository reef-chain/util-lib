import { describe, it, expect } from "vitest";
import { getTokenPrice } from "../../src/token/prices";
import { REEF_TOKEN, isNativeTransfer } from "../../src/token/index";

describe("prices", () => {
  it("should return reef token price", async () => {
    const res = await getTokenPrice("reef");
    expect(res).toBeGreaterThan(0.0);
  });
  it("should return true", () => {
    const res = isNativeTransfer(REEF_TOKEN);
    expect(res).toEqual(true);
  });
});
