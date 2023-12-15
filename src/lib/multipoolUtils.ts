import { Token } from "@/types/tokenlist";
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
    signature: Address
}> {
    const responce = await axios.get(`https://api.arcanum.to/oracle/v1/signed_price?multipool_id=${multipoolId}`);
    const data = await responce.data;

    if (data.toString() == "null") {
        return {
            contractAddress: "0x0000000000000000000000000000000000000000",
            timestamp: BigInt(0),
            sharePrice: BigInt(0),
            signature: "0x0"
        }
    }

    return {
        contractAddress: data.contractAddress,
        timestamp: BigInt(data.timestamp),
        sharePrice: BigInt(data.sharePrice),
        signature: data.signature
    }
}

function parseError(e: any): string | undefined {
    let errorString: string = (e as Error).toString();

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

async function getExternalAssets(chainId: number = 42161) {
    const responce = await axios.get(`https://tokens.1inch.io/v1.2/${chainId}`);
    const data: { [address: string]: Token } = await responce.data;

    const assets: Token[] = Object.values(data);

    return assets;
}

export { getForcePushPrice, parseError, getExternalAssets }
