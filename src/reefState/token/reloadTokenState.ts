import { map, share, switchMap } from "rxjs";
import { selectedAccountAddressChange$ } from "../account/selectedAccountAddressChange";
import { getLatestBlockAccountUpdates$ } from "../latestBlock";
import { AccountIndexedTransactionType } from "../latestBlockModel";

export const selectedAccountFtBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr =>
      getLatestBlockAccountUpdates$(
        [addr.data.address],
        [AccountIndexedTransactionType.REEF20_TRANSFER]
      )
    ),
    map(() => true),
    share()
  );

export const selectedAccountNftBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr =>
      getLatestBlockAccountUpdates$(
        [addr.data.address],
        [AccountIndexedTransactionType.REEF_NFT_TRANSFER]
      )
    ),
    map(() => true),
    share()
  );

export const selectedAccountAnyBalanceUpdate$ =
  selectedAccountAddressChange$.pipe(
    switchMap(addr =>
      getLatestBlockAccountUpdates$(
        [addr.data.address],
        [
          AccountIndexedTransactionType.REEF_NFT_TRANSFER,
          AccountIndexedTransactionType.REEF20_TRANSFER,
        ]
      )
    ),
    map(() => true),
    share()
  );
