import { TokenWithAddress } from "../hooks/tokens";
import { Quantities } from "./quantities";

type SendTransactionParams = {
    to: string,
    deadline: bigint,
    slippage: number,
    quantities: Quantities,
    tokenIn: TokenWithAddress,
    tokenOut: TokenWithAddress,
    priceIn: number,
    priceOut: number,
    routerAddress: string,
    multipoolAddress: string,
};

export { type SendTransactionParams }
