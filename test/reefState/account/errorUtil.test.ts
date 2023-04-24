import { getAddressesErrorFallback } from "../../../src/reefState/account/errorUtil";
import { describe, it, expect } from "vitest";

describe("getAddressesErrorFallback", () => {
  it("returns an observable with an array of feedback messages", done => {
    const err = { message: "Something went wrong" };
    const message = "Failed to retrieve balance";
    const propName = "balances";
    const expectedFeedback = [
      {
        data: null,
        feedbackCode: 3,
        feedbackMsg: "Failed to retrieve balanceSomething went wrong",
        feedbackProp: "balance",
      },
      {
        data: null,
        feedbackCode: 3,
        feedbackMsg: "Failed to retrieve balanceSomething went wrong",
        feedbackProp: "balance",
      },
      {
        data: null,
        feedbackCode: 3,
        feedbackMsg: "Failed to retrieve balanceSomething went wrong",
        feedbackProp: "balance",
      },
    ];

    const result$ = getAddressesErrorFallback(err, message, propName);
    result$.subscribe(feedback => {
      expect(feedback).toEqual(expectedFeedback);
      done();
    });
  });
});
