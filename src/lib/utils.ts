import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import BigNumber from "bignumber.js";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fromX32(value: string) {
  const inital = BigNumber(value)
  const decimals = BigNumber(2).pow(32)

  return inital.dividedBy(decimals).toPrecision(4, 0).toString();
}

export function fromX96(value: string, decimals = 18) {
  const inital = BigNumber(value, 10);
  const _decimals = BigNumber(2).pow(96);

  const fromUniswapType = inital.dividedBy(_decimals);

  const diifWithStandart = 18 - decimals;

  if (diifWithStandart == 0) {
    return fromUniswapType;
  }
  if (diifWithStandart > 0) {
    return fromUniswapType.dividedBy(new BigNumber(10).pow(diifWithStandart)) // .pow(BigNumber(10).pow(decimals));
  }
  if (diifWithStandart < 0) {
    return fromUniswapType.dividedBy(new BigNumber(10).pow(diifWithStandart)) // .pow(BigNumber(10).pow(decimals));
  }
}
