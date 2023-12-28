export interface BebopQuoteResponce {
    type: string;
    status: string;
    quoteId: string;
    chainId: number;
    approvalType: string;
    nativeToken: string;
    taker: string;
    receiver: string;
    isNewReceiver: boolean;
    expiry: number;
    gasFee: GasFee;
    settlementAddress: string;
    approvalTarget: string;
    hooksHash: string;
    toSign: ToSign;
    solver: string;
    buyTokens: { [key: string]: TokenAction };
    sellTokens: { [key: string]: TokenAction };
}

interface TokenAction {
    amount: string;
    decimals: string;
    priceUsd: string;
    symbol: string;
    price: string;
    priceBeforeFee: string;
    amountBeforeFee: string;
}

export interface GasFee {
    native: string;
    usd: number;
}

export interface ToSign {
    taker: string;
    receiver: string;
    expiry: number;
    nonce: string;
    executor: string;
    minFillPercent: number;
    hooksHash: string;
    sellTokens: string[];
    buyTokens: string[];
    sellAmounts: string[];
    buyAmounts: string[];
    sellTokenTransfers: string;
    buyTokenTransfers: string;
}

export function toObject(ToSign: ToSign | undefined) {
    if (!ToSign) return undefined;

    return {
        taker: ToSign.taker,
        receiver: ToSign.receiver,
        expiry: ToSign.expiry,
        nonce: ToSign.nonce,
        executor: ToSign.executor,
        minFillPercent: ToSign.minFillPercent,
        hooksHash: ToSign.hooksHash,
        sellTokens: ToSign.sellTokens,
        buyTokens: ToSign.buyTokens,
        sellAmounts: ToSign.sellAmounts,
        buyAmounts: ToSign.buyAmounts,
        sellTokenTransfers: ToSign.sellTokenTransfers,
        buyTokenTransfers: ToSign.buyTokenTransfers,
        sellNFTIds: [],
        buyNFTIds: [],
    } as const;
}
