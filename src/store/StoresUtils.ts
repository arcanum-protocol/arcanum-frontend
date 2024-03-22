import { MultipoolAsset, ExternalAsset, SolidAsset } from "@/types/multipoolAsset";
import BigNumber from "bignumber.js";
import { Address, encodeAbiParameters } from "viem";


function isETH(token: MultipoolAsset | ExternalAsset | SolidAsset | undefined) {
    if (token === undefined) return false;
    if (token.address === undefined) return false;
    if (token.address.toLowerCase() === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase()) return true;
    return false;
}

function fromBigNumberBigInt(value: BigNumber): bigint {
    return BigInt(value.decimalPlaces(0).toString());
}

function fromBigIntBigNumber(value: bigint): BigNumber {
    return new BigNumber(value.toString());
}

function createApproveCall(token: Address, target: Address, amount: BigNumber) {
    const data = encodeAbiParameters(
        [{ name: "token", type: "address" },    { name: "target", type: "address" },    { name: "amount", type: "uint256" }],
        [token,                                 target,                                 fromBigNumberBigInt(amount)]
    );
    return {
        callType: 1,
        data: data
    };
}

function createWrapCall(wrap: boolean = true, ethValue: BigNumber) {
    const wrapData = encodeAbiParameters(
        [{ name: "weth", type: "address" },             { name: "wrap", type: "bool" }, { name: "ethValue", type: "uint256" }],
        ["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",  wrap,                           fromBigNumberBigInt(ethValue)]
    );
    return {
        callType: 3,
        data: wrapData
    };
}

function sortAssets(assets: Map<`0x${string}`, bigint>) {
    return Array.from(
        assets.entries()
    ).sort(([firstAssets], [secondAssets]) => {
        return BigInt(firstAssets) < BigInt(secondAssets) ? -1 : 1;
    }).map(([address, amount]) => {
        return {
            assetAddress: address,
            amount: amount
        };
    });
}

function createTransferCall(token: Address, target: Address, amount: BigNumber | bigint) {
    if (typeof amount === "bigint") {
        amount = fromBigIntBigNumber(amount);
    }
    const data = encodeAbiParameters(
        [
            { name: "token", type: "address" },
            { name: "targetOrOrigin", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        [token, target, fromBigNumberBigInt(amount)]
    );
    return {
        callType: 0,
        data: data
    };
}

function truncateAddress(address: Address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export { isETH, createApproveCall, createWrapCall, fromBigNumberBigInt, fromBigIntBigNumber, sortAssets, createTransferCall, truncateAddress };
