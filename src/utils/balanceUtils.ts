export { toReefBalanceDisplay } from "./utils";
import { BigNumber } from "ethers";

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

export const formatDisplayBalance = (val: BigNumber, fraction = 4) => {
  const threshold = BigNumber.from("1000000000000000000");
  if (val.lt(threshold)) {
    var zeroPadding = _zeroPadding(
      val.toString(),
      18 - val.toString().length
    ).substring(0, fraction);
    if (_checkIfAllZeroes(zeroPadding)) {
      zeroPadding = `${zeroPadding.substring(0, fraction - 1)}1`;
    }
    return `0.${zeroPadding}`;
  }
  const balance = val.div(threshold);
  return `${_formatDouble(balance.toNumber())}`;
};
