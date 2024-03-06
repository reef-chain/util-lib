export { toReefBalanceDisplay } from "./utils";
import BigNumber from "bignumber.js";

export const formatHumanAmount = (value = ""): string => {
  let amount = new BigNumber(value.replaceAll(",", ""));
  let output = "";

  if (amount.isNaN()) return amount.toString();

  const decPlaces = 100;
  const abbrev = ["k", "M", "B"];

  for (let i = abbrev.length - 1; i >= 0; i -= 1) {
    // eslint-disable-next-line
    const size = Math.pow(10, (i + 1) * 3);

    if (amount.isGreaterThanOrEqualTo(size)) {
      amount = amount
        .times(decPlaces)
        .dividedBy(size)
        .integerValue()
        .dividedBy(decPlaces);

      if (amount.isEqualTo(1000) && i < abbrev.length - 1) {
        amount = BigNumber(1);
        i += 1;
      }

      output = `${amount.toString()} ${abbrev[i]}`;
      break;
    }
  }

  return output;
};

const toCurrencyFormat = (value: number): string =>
  Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
  }).format(value);

export const formatDisplayBalance = (
  value: string,
  decimals = 18,
  price = 1
): string => {
  // pass price in params if you are providing balance in token
  const balanceValue = new BigNumber(value)
    .div(new BigNumber(10).pow(decimals))
    .multipliedBy(price)
    .toNumber();

  const balance = new BigNumber(balanceValue);

  if (balance.isNaN()) return "0";

  if (balance.isGreaterThanOrEqualTo(1000000)) {
    const humanReadableBalance = formatHumanAmount(balance.toString());
    return `$${humanReadableBalance}`;
  }

  return toCurrencyFormat(balance.toNumber());
};
