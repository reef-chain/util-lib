import { bindEvmAddress } from "../../src/evm/bindUtil";
import {
  describe,
  it,
  expect,
  createFakeProvider,
  createFakeSigner,
} from "vitest";

describe("bindEvmAddress", () => {
  it("should return an empty string if no signer or provider is passed in", () => {
    const result = bindEvmAddress(null, null);
    expect(result).to.equal("");
  });

  it("should return an empty string if the signer has already claimed the Ethereum VM address", () => {
    const signer = createFakeSigner({ isEvmClaimed: true });
    const result = bindEvmAddress(signer, createFakeProvider());
    expect(result).to.equal("");
  });

  it("should call the success handler if onTxChange is not provided", done => {
    const signer = createFakeSigner({ evmAddress: "0x1234567890abcdef" });
    const provider = createFakeProvider();
    const alertStub = sinon.stub(window, "alert");
    const result = bindEvmAddress(signer, provider);

    setTimeout(() => {
      expect(alertStub).to.have.been.calledWith(
        `Success, Ethereum VM address is ${signer.evmAddress}. Use this address ONLY on Reef chain.`
      );
      alertStub.restore();
      done();
    }, 0);
  });

  it("should call the onTxChange handler if it is provided", done => {
    const signer = createFakeSigner();
    const provider = createFakeProvider();
    const txIdent = "12345";
    const handler = sinon.spy();
    const result = bindEvmAddress(signer, provider, handler);

    setTimeout(() => {
      expect(handler).to.have.been.calledWith({
        txIdent,
        isInBlock: true,
        addresses: [signer.address],
      });
      done();
    }, 0);
  });

  it("should call the error handler if the claimDefaultAccount call fails", done => {
    const signer = createFakeSigner();
    const provider = createFakeProvider();
    const error = new Error("Failed to claim default account");
    const handleErrStub = sinon.stub();
    const claimDefaultAccountStub = sinon
      .stub(signer.signer, "claimDefaultAccount")
      .rejects(error);
    const result = bindEvmAddress(signer, provider, null, handleErrStub);

    setTimeout(() => {
      expect(handleErrStub).to.have.been.calledWith(error);
      claimDefaultAccountStub.restore();
      done();
    }, 0);
  });
});
