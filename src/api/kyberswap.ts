import { BuildResponce, KyberswapResponce } from "@/types/kyberswap";
import axios from "axios";
import BigNumber from "bignumber.js";
import { Address } from "viem";

async function Create(shares: Map<Address, BigNumber>, inputAsset: Address, amountIn: BigNumber, userAddress: Address, multipoolAddress: Address) {
    if (amountIn === undefined) return
    if (amountIn.isZero()) return;
    const selectedAssets: Map<Address, BigNumber> = new Map<Address, BigNumber>();

    const quotes: KyberswapResponce[] = [];
    
    for (const asset of shares.keys()) {
        await new Promise(r => setTimeout(r, 700));
        const shareOfAmountIn = amountIn.multipliedBy(shares.get(asset)?.dividedBy(100)!);
        const quote = await Quote(inputAsset, asset, shareOfAmountIn);
        selectedAssets.set(asset, new BigNumber(quote.data.routeSummary.amountOut));

        quotes.push(quote);
    };

    await new Promise(r => setTimeout(r, 1000));

    const builds: BuildResponce[] = [];

    for (const quote of quotes) {
        await new Promise(r => setTimeout(r, 300));
        builds.push(await Build(quote, userAddress, multipoolAddress));
    };

    return {
        calldata: builds.map((build) => build.data.data),
        selectedAssets: selectedAssets
    }
}

async function Quote(assetIn: Address, assetOut: Address, amountIn: BigNumber) {
    const responce = await axios.get(`https://aggregator-api.kyberswap.com/arbitrum/api/v1/routes?tokenIn=${assetIn}&tokenOut=${assetOut}&amountIn=${amountIn.toFixed(0)}&saveGas=true`);
    const data: KyberswapResponce = responce.data;

    return data;
}

async function Build(quote: KyberswapResponce, userAddress: Address, multipoolAddress: Address) {
    // unixtime + 20 minutes
    const unixtime = Math.floor(Date.now() / 1000) + 1200;
    const responce = await axios.post(`https://aggregator-api.kyberswap.com/arbitrum/api/v1/route/build`, {
        deadline: unixtime,
        recipient: multipoolAddress,
        routeSummary: quote.data.routeSummary,
        sender: userAddress,
        skipSimulateTx: true,
        slippageTolerance: 5,
        source: "arcanum"
    });
    const data: BuildResponce = responce.data;

    return data;
}

export { Quote, Build, Create }
