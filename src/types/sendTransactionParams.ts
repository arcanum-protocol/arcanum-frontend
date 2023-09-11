import { Quantities } from "../components/trade-pane";
import { TokenWithAddress } from "../hooks/tokens";

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

export { SendTransactionParams }
