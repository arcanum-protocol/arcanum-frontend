import { BebopToken, Token } from "@/types/tokenlist";
import axios from "axios";
import { Address } from "viem";

const errors: { [key: string]: string } = {
    "InvalidForcePushAuthoritySignature()": "Invalid Force Push Authority Signature",
    "InvalidTargetShareSetterAuthority()": "Invalid Target Share Setter Authority",
    "ForcePushedPriceExpired(uint blockTimestamp, uint priceTimestestamp)": "Force Pushed Price Expired",
    "InsuficcientBalance()": "Insuficcient Balance",
    "SleepageExceeded()": "Sleepage Exceeded",
    "AssetsNotSortedOrNotUnique()": "Assets Not Sorted Or Not Unique",
    "IsPaused()": "Is Paused",
    "DeviationExceedsLimit()": "Deviation Exceeds Limit"
}

async function getForcePushPrice(multipoolId: string): Promise<{
    contractAddress: Address,
    timestamp: bigint,
    sharePrice: bigint,
    signatures: Address[]
}> {
    const responce = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${multipoolId}`);
    const data = await responce.data;

    if (data.toString() == "null") {
        return {
            contractAddress: "0x0000000000000000000000000000000000000000",
            timestamp: BigInt(0),
            sharePrice: BigInt(0),
            signatures: ["0x0"]
        }
    }

    return {
        contractAddress: data.contractAddress,
        timestamp: BigInt(data.timestamp),
        sharePrice: BigInt(data.sharePrice),
        signatures: [data.signature]
    }
}

function parseError(e: any, parse?: boolean): string | undefined {
    if (!e) {
        return undefined;
    }
    if (!parse) {
        return (e as string).toString();
    }
    let errorString: string = (e as Error).toString();
    
    if (errorString == "Error: Amount too small") return "Amount too small";
    if (errorString.includes("transfer amount exceeds balance")) return "Insufficient Balance";

    errorString = errorString.replace("ContractFunctionExecutionError: ", "");
    const startIndex = errorString.indexOf('Error: ');
    const endIndex = errorString.indexOf('\n', startIndex);

    const match = errorString.substring(startIndex + 7, endIndex);

    if (errors[match]) {
        return errors[match];
    } else {
        return undefined;
    }
}

async function getExternalAssets() {
    const InchResponce = await axios.get(`https://api.bebop.xyz/arbitrum/v2/tokens?active_only=true`);
    const data: { [name: string]: BebopToken } = await InchResponce.data.tokens;
    
    const assets = Object.values(data).map((token: BebopToken) => {
        return {
            name: token.name,
            symbol: token.ticker,
            address: token.chainInfo[0].contractAddress,
            decimals: token.chainInfo[0].decimals,
            logoURI: token.iconUrl,
            price: token.priceUsd
        };
    });

    return assets;
}

export { getForcePushPrice, parseError, getExternalAssets }
