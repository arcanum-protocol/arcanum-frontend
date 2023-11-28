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

export function fromX96(value: string) {
  const inital = BigNumber(value)
  const decimals = BigNumber(2).pow(96)

  return inital.dividedBy(decimals).toPrecision(4, 0).toString();
}
