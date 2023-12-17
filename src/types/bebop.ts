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
