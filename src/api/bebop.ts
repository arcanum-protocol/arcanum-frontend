import { Address, getAddress } from 'viem';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BebopQuoteResponce } from '@/types/bebop';


enum ApprovalType {
    Standard = "Standard",
    Permit = "Permit",
    Permit2 = "Permit2",
}

interface JAMQuoteParams {
    sellTokens: Address;
    buyTokens: Address;
    sellAmounts?: BigNumber;
    buyAmounts?: BigNumber;
    takerAddress: Address;
}

interface JAMOrderSubmitParams {
    quoteId: string;
    signature: Address;
}

export const PARAM_DOMAIN = {
    name: "JamSettlement",
    version: "1",
    chainId: 42161,
    verifyingContract: "0xbEbEbEb035351f58602E0C1C8B59ECBfF5d5f47b" as Address,
}

export const JAMBalanceManager = "0xfE96910cF84318d1B8a5e2a6962774711467C0be" as Address;

export const PARAM_TYPES = {
    "JamOrder": [
        { "name": "taker", "type": "address" },
        { "name": "receiver", "type": "address" },
        { "name": "expiry", "type": "uint256" },
        { "name": "nonce", "type": "uint256" },
        { "name": "executor", "type": "address" },
        { "name": "minFillPercent", "type": "uint16" },
        { "name": "hooksHash", "type": "bytes32" },
        { "name": "sellTokens", "type": "address[]" },
        { "name": "buyTokens", "type": "address[]" },
        { "name": "sellAmounts", "type": "uint256[]" },
        { "name": "buyAmounts", "type": "uint256[]" },
        { "name": "sellNFTIds", "type": "uint256[]" },
        { "name": "buyNFTIds", "type": "uint256[]" },
        { "name": "sellTokenTransfers", "type": "bytes" },
        { "name": "buyTokenTransfers", "type": "bytes" },
    ]
}

async function JAMQuote({ sellTokens, buyTokens, sellAmounts, buyAmounts, takerAddress }: JAMQuoteParams) {
    if (sellAmounts && buyAmounts) throw new Error("You can't specify both sellAmounts and buyAmounts");
    if (!sellAmounts && !buyAmounts) throw new Error("You must specify either sellAmounts or buyAmounts");

    const selltokens = getAddress(sellTokens).toString();
    const buytokens = getAddress(buyTokens).toString();

    if (sellAmounts) {
        const responce = await axios.get(`https://api.bebop.xyz/jam/arbitrum/v1/quote?sell_tokens=${selltokens}&buy_tokens=${buytokens}&sell_amounts=${sellAmounts.toString()}&taker_address=${takerAddress}&approval_type=${ApprovalType.Standard}`);
        if (responce.data.error) throw new Error("Amount too small");
        const data: BebopQuoteResponce = await responce.data;

        const buyAmt = BigNumber(data.buyTokens[buytokens].amount);
        const buyPrice = BigNumber(data.buyTokens[buytokens].priceUsd);

        const sellPrice = BigNumber(data.sellTokens[selltokens].priceUsd);
        const gasFee = BigNumber(data.gasFee.native);

        return {
            sellAmounts: sellAmounts,
            sellPrice: sellPrice,
            buyAmounts: buyAmt,
            buyPrice: buyPrice,
            gasFee: gasFee,
            toSign: data.toSign,
            orderId: data.quoteId,
        }
    }

    if (buyAmounts) {
        const responce = await axios.get(`https://api.bebop.xyz/jam/arbitrum/v1/quote?sell_tokens=${selltokens}&buy_tokens=${buytokens}&buy_amounts=${buyAmounts.toString()}&taker_address=${takerAddress}&approval_type=${ApprovalType.Standard}`);
        if (responce.data.error) throw new Error("Amount too small");
        const data: BebopQuoteResponce = await responce.data;

        const sellAmt = BigNumber(data.sellTokens[selltokens].amount);
        const sellPrice = BigNumber(data.sellTokens[selltokens].priceUsd);

        const buyPrice = BigNumber(data.buyTokens[buytokens].priceUsd);
        const gasFee = BigNumber(data.gasFee.native);

        return {
            sellAmounts: sellAmt,
            sellPrice: sellPrice,
            buyAmounts: buyAmounts,
            buyPrice: buyPrice,
            gasFee: gasFee,
            toSign: data.toSign,
            orderId: data.quoteId,
        }
    }

    return undefined;
}

async function submitOrder({ quoteId, signature }: JAMOrderSubmitParams) {
    if (!quoteId) throw new Error("quoteId is required");

    const responce = await axios.post(`https://api.bebop.xyz/jam/arbitrum/v1/order`, {
        quote_id: quoteId,
        signature: signature
    }, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
    const data: BebopQuoteResponce = responce.data;

    return data;
}

export { JAMQuote, submitOrder };
