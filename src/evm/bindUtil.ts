import { Provider } from '@reef-defi/evm-provider';
import { handleErr, TxStatusHandler, TxStatusUpdate } from '../token/transactionUtil';
import {ReefSigner} from "../account/accountModel";

export const bindEvmAddress = (
  signer: ReefSigner,
  provider: Provider,
  onTxChange?: TxStatusHandler,
): string => {
  if (!provider || !signer || signer?.isEvmClaimed) {
    return '';
  }

  const txIdent = Math.random().toString(10);
  signer.signer
    .claimDefaultAccount()
    .then(() => {
      if (!onTxChange) {
        alert(`Success, Ethereum VM address is ${signer.evmAddress}. Use this address ONLY on Reef chain.`);
      } else {
        onTxChange({
          txIdent,
          isInBlock: true,
          addresses: [signer.address],
        });
      }
    })
    .catch((err) => {
      const errHandler = onTxChange
        || ((txStat: TxStatusUpdate) => alert(txStat.error?.message));
      handleErr(err, txIdent, '', errHandler, signer);
    });
  return txIdent;
};
