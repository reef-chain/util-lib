import {Provider, Signer} from '@reef-defi/evm-provider';
import type {Signer as InjectedSigner, } from '@polkadot/api/types';
import {web3FromSource} from '@reef-defi/extension-dapp';
import {ReefAccount} from "../../src/account/accountModel";
import {REEF_EXTENSION_IDENT} from "@reef-defi/extension-inject";
import {accountsJsonSigningKeySubj} from "../../src/reefState/account/setAccounts";
import {SignerPayloadJSON, SignerPayloadRaw, SignerResult} from "@polkadot/types/types/extrinsic";
import { Deferrable } from '@ethersproject/properties';
import {
  TransactionRequest,
  TransactionResponse
} from '@ethersproject/abstract-provider';

import {
    getReefAccountSigner,
} from '../../src/account/accountSignerUtils'

import { describe, it, expect } from 'vitest';


jest.mock("./example", () => ({
    getAccountSigner: jest.fn(),
    accountsJsonSigningKeySubj: {
      getValue: jest.fn(),
    },
  }));

  describe("getReefAccountSigner", () => {
    it("should call getAccountSigner with the correct parameters", async () => {
      // Arrange
      const address = "0x123abc";
      const source = "extension";
      const provider = {} as Provider;

      // Mock accountsJsonSigningKeySubj.getValue()
      const mockGetValue = jest
        .spyOn(getReefAccountSigner.accountsJsonSigningKeySubj, "getValue")
        .mockReturnValue(source);

      // Act
      await getReefAccountSigner({ address, source }, provider);

      // Assert
      expect(mockGetValue).toHaveBeenCalledTimes(1);
      expect(mockGetValue).toHaveBeenCalledWith();

      expect(getReefAccountSigner.getAccountSigner).toHaveBeenCalledTimes(1);
      expect(getReefAccountSigner.getAccountSigner).toHaveBeenCalledWith(
        address,
        provider,
        source
      );
    });

    it("should return the result of getAccountSigner", async () => {
      // Arrange
      const address = "0x123abc";
      const source = "extension";
      const provider = {} as Provider;
      const signer = {} as any;

      // Mock getAccountSigner()
      jest.spyOn(getReefAccountSigner, "getAccountSigner").mockResolvedValue(signer);

      // Act
      const result = await getReefAccountSigner({ address, source }, provider);

      // Assert
      expect(result).toBe(signer);
    });
});
