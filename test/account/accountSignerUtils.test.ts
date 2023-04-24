import { Provider, Signer } from "@reef-defi/evm-provider";
import {
  getReefAccountSigner,
  getAccountSigner,
} from "../../src/account/accountSignerUtils";
import { ReplaySubject, Subject, BehaviorSubject } from "rxjs";
import type { Signer as InjectedSigningKey } from "@polkadot/api/types";

import { describe, it, expect } from "vitest";
import jest from "jest";

jest.mock("./example", () => ({
  getAccountSigner: jest.fn(),
}));

describe("getReefAccountSigner", () => {
  it("should call getAccountSigner with the correct parameters", async () => {
    // Arrange
    const address = "0x123abc";
    const source = "extension";
    const provider = {} as Provider;
    const accountsJsonSigningKeySubj =
      new BehaviorSubject<InjectedSigningKey | null>(null);

    // Mock accountsJsonSigningKeySubj.getValue()
    const mockGetValue = jest
      .spyOn(accountsJsonSigningKeySubj, "getValue")
      .mockReturnValue(source);

    // Act
    await getReefAccountSigner({ address, source }, provider);

    // Assert
    expect(mockGetValue).toHaveBeenCalledTimes(1);
    expect(mockGetValue).toHaveBeenCalledWith();

    expect(getAccountSigner).toHaveBeenCalledTimes(1);
    expect(getAccountSigner).toHaveBeenCalledWith(address, provider, source);
  });

  it("should return the result of getAccountSigner", async () => {
    // Arrange
    const address = "0x123abc";
    const source = "extension";
    const provider = {} as Provider;
    const signer = {} as any;

    // Mock getAccountSigner()
    jest
      .spyOn(getReefAccountSigner, "getAccountSigner")
      .mockResolvedValue(signer);

    // Act
    const result = await getReefAccountSigner({ address, source }, provider);

    // Assert
    expect(result).toBe(signer);
  });
});
