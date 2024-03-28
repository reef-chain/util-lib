export { toReefBalanceDisplay } from "./utils";
import { BigNumber } from "ethers";
import * as bigNumber from "bignumber.js";

const formatHumanAmount = (value = ""): string => {
  let amount = new bigNumber.BigNumber(value.split(",").join(""));
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
        amount = bigNumber.BigNumber(1);
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

const defaultTokenDetails: TokenBalance = {
  price: 1,
  decimals: 18,
  symbol: "",
};

const formatHumanReadableBalance = (
  value: string,
  tokenDetails: TokenBalance
): string => {
  const _tokenDetails = { ...defaultTokenDetails, ...tokenDetails };
  // pass price in params if you are providing balance in token
  const balanceValue = new bigNumber.BigNumber(value)
    .div(new bigNumber.BigNumber(10).pow(_tokenDetails.decimals))
    .multipliedBy(_tokenDetails.price)
    .toNumber();

  const balance = new bigNumber.BigNumber(balanceValue);
  const isSymbol = _tokenDetails.symbol.length > 0;

  if (balance.isNaN()) return "0";

  if (balance.isGreaterThanOrEqualTo(1000000)) {
    const humanReadableBalance = formatHumanAmount(balance.toString());
    return isSymbol
      ? `${humanReadableBalance} ${_tokenDetails.symbol}`
      : `$${humanReadableBalance}`;
  }

  return isSymbol
    ? `${toCurrencyFormat(balance.toNumber()).split("$")[1]} ${
        _tokenDetails.symbol
      }`
    : toCurrencyFormat(balance.toNumber());
};

const _zeroPadding = (val: string, num: number): string => {
  while (num - 1 > 0) {
    val = "0" + val;
    num--;
  }
  return val;
};

const _checkIfAllZeroes = (num: string): boolean => {
  for (var i = 0; i < num.length; i++) {
    if (num[i] != "0") return false;
  }
  return true;
};

const _formatDouble = (value: number): string => {
  if (value < 1000) {
    return value.toFixed(0).toString();
  } else if (value < 1000000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else if (value < 1000000000) {
    return `${(value / 1000000).toFixed(3)}M`;
  } else if (value < 1000000000000) {
    return `${(value / 1000000000).toFixed(3)}B`;
  } else {
    return `${(value / 1000000000000).toFixed(3)}T`;
  }
};

interface TokenBalance {
  symbol?: string;
  decimals?: number;
  price?: number;
}

export const formatDisplayBalance = (
  val: BigNumber | string,
  fraction = 4,
  tokenDetails?: TokenBalance
): string => {
  const threshold = BigNumber.from("1000000000000000000");
  if (tokenDetails && typeof val == "string") {
    return formatHumanReadableBalance(val, tokenDetails);
  }
  if ((val as BigNumber).lt(threshold)) {
    var zeroPadding = _zeroPadding(
      val.toString(),
      18 - val.toString().length
    ).substring(0, fraction);
    if (_checkIfAllZeroes(zeroPadding)) {
      zeroPadding = `${zeroPadding.substring(0, fraction - 1)}1`;
    }
    return `0.${zeroPadding}`;
  }
  const balance = (val as BigNumber).div(threshold);
  return `${_formatDouble(balance.toNumber())}`;
};
