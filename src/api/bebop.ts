import { Address } from 'viem';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { BebopQuoteResponce } from '@/types/bebop';


enum ApprovalType {
    Standart = "Standart",
    Permit = "Permit",
    Permit2 = "Permit2",
}

interface JAMQuoteParams {
    sellTokens: string;
    buyTokens: string;
    sellAmounts?: BigNumber;
    buyAmounts?: BigNumber;
    takerAddress: Address;
}

async function JAMQuote({ sellTokens, buyTokens, sellAmounts, buyAmounts, takerAddress }: JAMQuoteParams) {
    if (sellAmounts && buyAmounts) throw new Error("You can't specify both sellAmounts and buyAmounts");
    if (!sellAmounts && !buyAmounts) throw new Error("You must specify either sellAmounts or buyAmounts");

    if (sellAmounts) {
        const responce = await axios.get(`https://api.arcanum.to/api/quote?sell_tokens=${sellTokens}&buy_tokens=${buyTokens}&sell_amounts=${sellAmounts.toString()}&taker_address=${takerAddress}&approval_type=${ApprovalType.Standart}`);
        const data: BebopQuoteResponce = await responce.data;

        const buyAmt = BigNumber(data.buyTokens[buyTokens].amount);
        const buyPrice = BigNumber(data.buyTokens[buyTokens].price);

        const sellPrice = BigNumber(data.sellTokens[sellTokens].price);

        return {
            sellAmounts: sellAmounts,
            sellPrice: BigNumber(sellPrice),
            buyAmounts: BigNumber(buyAmt),
            buyPrice: BigNumber(buyPrice),
        }
    }

    if (buyAmounts) {
        const responce = await axios.get(`https://api.arcanum.to/api/quote?sell_tokens=${sellTokens}&buy_tokens=${buyTokens}&buy_amounts=${buyAmounts.toString()}&taker_address=${takerAddress}&approval_type=${ApprovalType.Standart}`);
        const data: BebopQuoteResponce = await responce.data;

        const sellAmt = BigNumber(data.sellTokens[sellTokens].amount);
        const sellPrice = BigNumber(data.sellTokens[sellTokens].price);

        const buyPrice = BigNumber(data.buyTokens[buyTokens].price);

        return {
            sellAmounts: BigNumber(sellAmt),
            sellPrice: BigNumber(sellPrice),
            buyAmounts: buyAmounts,
            buyPrice: BigNumber(buyPrice),
        }
    }
}

export { JAMQuote };
