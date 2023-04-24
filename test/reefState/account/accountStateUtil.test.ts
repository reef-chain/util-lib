import {
  isUpdateAll,
  getSignersToUpdate,
  updateSignersEvmBindings,
} from "../../../src/reefState/account/accountStateUtil";
import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import { ReefAccount } from "reef.js/dist/typings/Account";
import { FeedbackStatusCode, isFeedbackDM, toFeedbackDM } from "feedback-dm";
import { Provider } from "@ethersproject/providers";
import { StatusDataObject } from "../../../src/reefState/model/statusDataObject";

describe("isUpdateAll", () => {
  it("returns true if addresses is null", () => {
    const addresses = null;
    expect(isUpdateAll(addresses)).toBe(true);
  });

  it("returns true if addresses is an empty array", () => {
    const addresses = [];
    expect(isUpdateAll(addresses)).toBe(true);
  });

  it("returns false if addresses is not null or an empty array", () => {
    const addresses = ["address1", "address2"];
    expect(isUpdateAll(addresses)).toBe(false);
  });
});

describe("getSignersToUpdate", () => {
  const updateType = "someUpdateType";
  const updateActions = [{ type: "someActionType", data: {} }];
  const signers = [
    { address: "address1", name: "Signer 1" },
    { address: "address2", name: "Signer 2" },
    { address: "address3", name: "Signer 3" },
  ];

  it("returns all signers if updAddresses is null", () => {
    const updAddresses = null;
    const result = getSignersToUpdate(updateType, updateActions, signers);
    expect(result).toEqual(signers);
  });

  it("returns all signers if updAddresses is an empty array", () => {
    const updAddresses = [];
    const result = getSignersToUpdate(updateType, updateActions, signers);
    expect(result).toEqual(signers);
  });

  it("returns signers whose addresses match the updAddresses", () => {
    const updAddresses = ["address1", "address3"];
    const result = getSignersToUpdate(updateType, updateActions, signers);
    expect(result).toEqual([
      { address: "address1", name: "Signer 1" },
      { address: "address3", name: "Signer 3" },
    ]);
  });
});

describe("replaceUpdatedSigners", () => {
  const existingSigners: StatusDataObject<ReefAccount>[] = [
    { id: "1", data: { address: "address1", name: "name1" } },
    { id: "2", data: { address: "address2", name: "name2" } },
    { id: "3", data: { address: "address3", name: "name3" } },
  ];

  const updatedSigners: StatusDataObject<ReefAccount>[] = [
    { id: "1", data: { address: "address1", name: "new name1" } },
    { id: "4", data: { address: "address4", name: "name4" } },
    { id: "5", data: { address: "address5", name: "name5" } },
  ];

  it("should return existing signers if updated signers are not provided", () => {
    const result = replaceUpdatedSigners(existingSigners);

    expect(result).toEqual(existingSigners);
  });

  it("should return existing signers if updated signers is an empty array", () => {
    const result = replaceUpdatedSigners(existingSigners, []);

    expect(result).toEqual(existingSigners);
  });

  it("should replace existing signers with updated signers for matching addresses", () => {
    const expected: StatusDataObject<ReefAccount>[] = [
      { id: "1", data: { address: "address1", name: "new name1" } },
      { id: "2", data: { address: "address2", name: "name2" } },
      { id: "3", data: { address: "address3", name: "name3" } },
    ];

    const result = replaceUpdatedSigners(existingSigners, updatedSigners);

    expect(result).toEqual(expected);
  });

  it("should append new signers if appendNew is true", () => {
    const expected: StatusDataObject<ReefAccount>[] = [
      { id: "1", data: { address: "address1", name: "new name1" } },
      { id: "2", data: { address: "address2", name: "name2" } },
      { id: "3", data: { address: "address3", name: "name3" } },
      { id: "4", data: { address: "address4", name: "name4" } },
      { id: "5", data: { address: "address5", name: "name5" } },
    ];

    const result = replaceUpdatedSigners(existingSigners, updatedSigners, true);

    expect(result).toEqual(expected);
  });

  it("should return existing signers if appendNew is false and existing signers is empty", () => {
    const result = replaceUpdatedSigners([], updatedSigners, false);

    expect(result).toEqual([]);
  });
});

// Mock dependencies
jest.mock("some-relevant-dependency");

describe("updateSignersEvmBindings", () => {
  it("should return an empty array if signers is empty", async () => {
    const updateActions = [];
    const provider = {}; // Mock provider object
    const signers = [];
    const result = await updateSignersEvmBindings(
      updateActions,
      provider,
      signers
    );
    expect(result).toEqual([]);
  });

  it("should update signers EVM bindings", async () => {
    const updateActions = [
      {
        type: "UPDATE",
        dataType: "ACCOUNT_EVM_BINDING",
        data: { address: "0x123", evmAddress: "0xabc" },
      },
    ];
    const provider = {}; // Mock provider object
    const signers = [
      { data: { address: "0x123" } },
      { data: { address: "0x456" } },
    ];
    // Mock the getReefAccountSigner function
    const getReefAccountSigner = jest.fn(sig => {
      return Promise.resolve({ isClaimed: () => true }); // Mocked result
    });
    jest.mock("./path/to/getReefAccountSigner", () => ({
      getReefAccountSigner,
    }));
    const result = await updateSignersEvmBindings(
      updateActions,
      provider,
      signers
    );
    expect(result).toEqual([
      {
        data: { address: "0x123", isEvmClaimed: true },
        statusCode: "COMPLETE_DATA",
      },
      {
        data: { address: "0x456" },
        statusCode: "MISSING_INPUT_VALUES",
        message: "ERROR: Can not get account signer.",
      },
    ]);
    expect(getReefAccountSigner.mock.calls).toEqual([
      [{ data: { address: "0x123" } }, provider],
      [{ data: { address: "0x456" } }, provider],
    ]);
  });
});
