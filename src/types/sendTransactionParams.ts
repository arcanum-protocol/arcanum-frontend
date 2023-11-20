import BigNumber from "bignumber.js";
import { TokenWithAddress } from "../hooks/tokens";
import { Quantities } from "./quantities";

type SendTransactionParams = {
    to: string,
    deadline: BigNumber,
    slippage: number,
    quantities: Quantities,
    tokenIn: TokenWithAddress | undefined,
    tokenOut: TokenWithAddress | undefined,
    priceIn: number,
    priceOut: number,
    routerAddress: string,
    multipoolAddress: string,
};

export { type SendTransactionParams }
