import { toTxErrorCodeValue } from "../../src/transaction/txErrorUtil";
import { describe, expect, it } from "vitest";

describe("toTxErrorCodeValue", () => {
  enum TX_STATUS_ERROR_CODE {
    ERROR_MIN_BALANCE_AFTER_TX = "ERROR_MIN_BALANCE_AFTER_TX",
    ERROR_BALANCE_TOO_LOW = "ERROR_BALANCE_TOO_LOW",
    ERROR_UNDEFINED = "ERROR_UNDEFINED",
    CANCELED = "CANCELED",
  }

  it("should return ERROR_MIN_BALANCE_AFTER_TX code for revert message", () => {
    const error = { message: "-32603: execution revert: 0x123456" };
    const result = toTxErrorCodeValue(error);
    expect(result.code).toEqual(
      TX_STATUS_ERROR_CODE.ERROR_MIN_BALANCE_AFTER_TX
    );
    expect(result.message).toEqual(
      "You must allow minimum 60 REEF on account for Ethereum VM transaction even if transaction fees will be much lower."
    );
  });

  it("should return ERROR_BALANCE_TOO_LOW code for 1010 message", () => {
    const error = { message: "1010 Some error message" };
    const result = toTxErrorCodeValue(error);
    expect(result.code).toEqual(TX_STATUS_ERROR_CODE.ERROR_BALANCE_TOO_LOW);
    expect(result.message).toEqual("Balance too low.");
  });

  it("should return CANCELED code for _canceled message", () => {
    const error = { message: "_canceled" };
    const result = toTxErrorCodeValue(error);
    expect(result.code).toEqual(TX_STATUS_ERROR_CODE.CANCELED);
    expect(result.message).toEqual("Canceled");
  });

  it("should return ERROR_BALANCE_TOO_LOW code for balances.InsufficientBalance message", () => {
    const error = { message: "balances.InsufficientBalance" };
    const result = toTxErrorCodeValue(error);
    expect(result.code).toEqual(TX_STATUS_ERROR_CODE.ERROR_BALANCE_TOO_LOW);
    expect(result.message).toEqual("Balance too low for transfer and fees.");
  });

  it("should return ERROR_UNDEFINED code for other message", () => {
    const error = { message: "Some other error message" };
    const result = toTxErrorCodeValue(error);
    expect(result.code).toEqual(TX_STATUS_ERROR_CODE.ERROR_UNDEFINED);
    expect(result.message).toEqual(
      "Transaction error: Some other error message"
    );
  });
});
