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

export function fromX96(value: bigint, decimals = 18): BigNumber {
  const _decimals = 2n ** 96n;

  const fromUniswapType = new BigNumber(value.toString()).div(_decimals.toString());

  const diifWithStandart = 18n - BigInt(decimals);

  if (diifWithStandart == 0n) {
    return fromUniswapType;
  }

  return fromUniswapType.div(new BigNumber(10).pow(diifWithStandart.toString()));
}
