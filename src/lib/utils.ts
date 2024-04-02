import BigNumber from "bignumber.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fromX32(value: bigint): bigint {
  const decimals = 2n ** 32n;

  return value / decimals;
}

export function fromX96(value: bigint | undefined, decimals = 18): BigNumber {
  if (value === undefined) return new BigNumber(0);

  const _decimals = 2n ** 96n;

  const fromUniswapType = new BigNumber(value.toString()).div(_decimals.toString());

  const diifWithStandart = 18n - BigInt(decimals);

  if (diifWithStandart == 0n) {
    return fromUniswapType;
  }

  return fromUniswapType.div(new BigNumber(10).pow(diifWithStandart.toString()));
}

export function fromBigNumber(value: BigNumber | undefined): bigint {
  if (value === undefined || value.isNaN()) return BigInt(0);
  return BigInt(value.toFixed(0));
}

export function tohumanReadableQuantity(number: BigNumber, decimals = 18) {
  const subsrint = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  const _decimals = new BigNumber(10).pow(decimals);
  if (number.isEqualTo(0)) {
    return "0";
  }
  if (number.dividedBy(_decimals).isLessThan(0.001)) {
    const _number = number.dividedBy(_decimals).toFixed();
    const numberWithout_zerodotzero = _number.substring(3, _number.length);

    // regex to remove trailing zeros
    const numberWithoutTrailingZeros = numberWithout_zerodotzero.replace(/^0+(?=\d)/, '');
    const trailingZerosCount = numberWithout_zerodotzero.length - numberWithoutTrailingZeros.length;
    // replase the zeros with the subscript
    const numberWithSubscript = trailingZerosCount.toString().split("").map((char) => subsrint[parseInt(char)]).join("");

    return `0.0${numberWithSubscript}${numberWithoutTrailingZeros}`;
  } else {
    const _decimals = new BigNumber(10).pow(decimals);
    const _number = new BigNumber(number.toString());

    const value = _number.dividedBy(_decimals);
    return value.toFixed(3);
  }
}

export function toHumanReadableDollarValue(value: BigNumber) {
  // k - thousand, m - million, b - billion, t - trillion, q - quadrillion
  if (value.isLessThan(1000)) {
    return value.toFixed(2);
  } else if (value.isLessThan(1000000)) {
    return `${(value.dividedBy(1000)).toFixed(2)}k`;
  } else if (value.isLessThan(1000000000)) {
    return `${(value.dividedBy(1000000)).toFixed(2)}m`;
  } else if (value.isLessThan(1000000000000)) {
    return `${(value.dividedBy(1000000000)).toFixed(2)}b`;
  } else if (value.isLessThan(1000000000000000)) {
    return `${(value.dividedBy(1000000000000)).toFixed(2)}t`;
  } else {
    return `${(value.dividedBy(1000000000000000)).toFixed(2)}q`;
  }
}

export function parseError(error: any) {
  const strError = error.toString();
  if (strError.includes("DeviationExceedsLimit")) {
    return "DeviationExceedsLimit";
  }
}
