import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { accountsLocallyUpdatedData$ } from "../../../src/reefState/account/accountsLocallyUpdatedData";
import { describe, it, expect } from "vitest";
import jest from "jest";
import { beforeEach, afterEach, beforeAll, afterAll } from "@jest/globals";

const mockUpdateSignersEvmBindings = jest.fn();
jest.mock("./your-module", () => ({
  accountsLocallyUpdatedData$: of({}).pipe(delay(100)), // Mock empty response for now
}));

describe("accountsLocallyUpdatedData$", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the account data when updateSignersSubj emits", async () => {
    const mockUpdateCtx = { updateActions: ["action1", "action2"] };
    const mockSignersInjected = [
      { address: "address1" },
      { address: "address2" },
    ];
    const mockProvider = { send: jest.fn() };

    // Mock the functions called within the observable
    jest.spyOn(global, "Promise").mockImplementation(executor => {
      executor(res => {
        mockUpdateSignersEvmBindings.mockResolvedValueOnce(res);
      }, jest.fn());
    });
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => ({ getTime: () => 123456 }));

    // Simulate a reload context update
    updateSignersSubj.next({ updateActions: ["action1", "action2"] });

    // Wait for the observable to emit
    const result = await accountsLocallyUpdatedData$.toPromise();

    expect(mockUpdateSignersEvmBindings).toHaveBeenCalledWith(
      mockUpdateCtx.updateActions,
      mockSignersInjected.map(s =>
        toFeedbackDM(s, FeedbackStatusCode.COMPLETE_DATA)
      )
    );
    expect(mockProvider.send).toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it("should handle errors and emit a feedback object with the error message", async () => {
    const mockError = new Error("Something went wrong");
    jest.spyOn(global, "Promise").mockImplementation(executor => {
      executor(jest.fn(), () => {
        throw mockError;
      });
    });

    // Simulate a reload context update
    updateSignersSubj.next({ updateActions: ["action1"] });

    // Wait for the observable to emit
    const result = await accountsLocallyUpdatedData$.toPromise();

    expect(result).toEqual(
      toFeedbackDM([], FeedbackStatusCode.ERROR, mockError.message)
    );
  });
});
