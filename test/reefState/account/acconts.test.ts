import { toInjectedAccountsWithMeta } from "../../../src/reefState/account/accounts";
import { describe, it, expect } from "vitest";

describe("toInjectedAccountsWithMeta", () => {
  it("should add meta information to each injected account", () => {
    // Arrange
    const injAccounts = [
      { address: "0x123", name: "Account 1" },
      { address: "0x456", name: "Account 2" },
      { address: "0x789", name: "Account 3" },
    ];

    const expected = [
      {
        address: "0x123",
        meta: { name: "Account 1", source: "REEF_EXTENSION_IDENT" },
      },
      {
        address: "0x456",
        meta: { name: "Account 2", source: "REEF_EXTENSION_IDENT" },
      },
      {
        address: "0x789",
        meta: { name: "Account 3", source: "REEF_EXTENSION_IDENT" },
      },
    ];

    // Act
    const result = toInjectedAccountsWithMeta(injAccounts);

    // Assert
    expect(result).toEqual(expected);
  });
});
