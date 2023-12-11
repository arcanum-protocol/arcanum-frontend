import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fromX32(value: bigint): bigint {
  const decimals = 2n ** 32n;

  return value / decimals;
}

export function fromX96(value: bigint, decimals = 18): bigint {
  const _decimals = 2n ** 96n;

  const fromUniswapType = value / _decimals;

  const diifWithStandart = 18n - BigInt(decimals);

  if (diifWithStandart == 0n) {
    return fromUniswapType;
  }

  return fromUniswapType / 10n ** diifWithStandart;
}
