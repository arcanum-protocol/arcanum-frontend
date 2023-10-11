import _ from "lodash";
import { Address } from 'wagmi'
import { Button } from "./ui/button";
import { QuantityInput } from './quantity-input';
import { SolidAsset } from "../types/solidAsset";
import { useTokenWithAddress } from '../hooks/tokens';
import { toHumanReadable } from '../lib/format-number';
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useTradeContext } from "../contexts/TradeContext";
import type { MultipoolAsset } from "../types/multipoolAsset";
import { InteractionWithApprovalButton } from './approval-button';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useMultiPoolContext } from "@/contexts/MultiPoolContext";
import type { TradeLogicAdapter } from '../types/tradeLogicAdapter';
import { TransactionParamsSelector } from './transaction-params-selector';
import type { SendTransactionParams } from '../types/sendTransactionParams';


interface TradePaneProps {
    assetsIn: MultipoolAsset[] | SolidAsset;
    assetsOut: MultipoolAsset[] | SolidAsset;
    action: "mint" | "burn" | "swap" | "add";
    networkId: number;
}

export function TradePaneInner({
    action,
    networkId
}: TradePaneProps) {
    const {
        tokenIn,
        tokenOut,
        externalAssets,
        setTokenIn,
        setTokenOut,
        multipool
    } = useMultiPoolContext();

    if (action === "mint") {
        setTokenIn(externalAssets?.[0]);
        setTokenOut(multipool);
    }
    if (action === "burn") {
        setTokenIn(multipool);
        setTokenOut(externalAssets?.[0]);
    }
    if (action === "swap") {
        setTokenIn(externalAssets?.[0]);
        setTokenOut(externalAssets?.[1]);
    }

    const {
        userAddress,
        setSlippage,
        routerAddress,
        transactionCost,
        sendTransctionParams
    } = useTradeContext();

    const { data: inputToken } = useTokenWithAddress({ tokenAddress: tokenIn?.address, userAddress: userAddress, allowanceTo: routerAddress, chainId: networkId });
    const { data: outputToken } = useTokenWithAddress({ tokenAddress: tokenOut?.address, userAddress: userAddress, allowanceTo: routerAddress, chainId: networkId });

    return (
        <div className="flex flex-col justify-center w-[400px] mt-[20px]">
            <TokenQuantityInput
                text={"Send"}
                decimals={inputToken?.decimals!}
                balance={inputToken?.balance.formatted || "0"}
                chainId={networkId}
            />
            <TokenQuantityInput
                text={"Receive"}
                decimals={outputToken?.decimals!}
                balance={outputToken?.balance.formatted || "0"}
                chainId={networkId}
            />
            <div style={{ display: "flex", flexDirection: "column", margin: "20px", marginTop: "10px", rowGap: "30px" }}>
                <TransactionParamsSelector txnCost={transactionCost} txnParams={sendTransctionParams} slippageSetter={() => setSlippage} />
                <InteractionWithApprovalButton
                    approveMax={true}
                    token={inputToken}
                    networkId={networkId}
                />
            </div>
        </div>
    );
}

interface TokenQuantityInputProps {
    text: "Send" | "Receive";
    decimals: number;
    balance: string;
    chainId: number;
}

export function TokenQuantityInput({
    text,
    decimals,
    balance,
    chainId
}: TokenQuantityInputProps) {
    const { estimatedValues } = useTradeContext();
    const { tokenIn, tokenOut, selectToken } = useMultiPoolContext();

    let tokenSymbol: string | undefined = undefined;
    let logoImage: string | undefined = undefined;
    let estimatedValuesText: string | undefined = undefined;

    if (text === "Send") {
        tokenSymbol = tokenIn?.symbol || undefined;
        logoImage = tokenIn?.logo || undefined;
        estimatedValuesText = estimatedValues?.estimatedAmountIn?.usd || "0";
    } else {
        tokenSymbol = tokenOut?.symbol || undefined;
        logoImage = tokenOut?.logo || undefined;
        estimatedValuesText = estimatedValues?.estimatedAmountOut?.usd || "0";
    }

    return (
        <div className="flex flex-col justify-between items-start rounded-2xl border h-full mx-[20px] my-[1px] p-3">
            <p className="text-xs m-0">{text} </p>
            <div className="flex flex-row flex-start items-start justify-between">
                <QuantityInput className="flex-auto w-3/4"
                    decimals={decimals}
                    quantityInputName={text}
                    chainId={chainId}
                />
                <Button className="grow max-w-min rounded-2xl pl-0.5 pr-0.5 justify-between" variant="secondary" onClick={() => selectToken(text)}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={logoImage} alt="Logo" />
                        <AvatarFallback>{tokenSymbol}</AvatarFallback>
                    </Avatar>
                    <p className="px-0.5">{tokenSymbol}</p>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                </Button>
            </div>
            <div className="flex flex-row justify-between w-full mt-[4px]">
                <p className="m-0 text-xs text-gray-500">
                    {estimatedValuesText + "$"}
                </p>
                <p className="m-0 text-gray-500 text-xs">
                    Balance: {toHumanReadable(balance)}
                </p>
            </div>
        </div>
    );
}

export { TradeLogicAdapter, SendTransactionParams };
