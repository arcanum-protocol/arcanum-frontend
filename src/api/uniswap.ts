import BigNumber from "bignumber.js";
import { Address, decodeAbiParameters } from "viem";
import { arbitrumPublicClient } from "@/config";
import UniswapV3 from '../abi/UniswapV3';
import {
    Pool,
    Route,
    SwapOptions,
    SwapQuoter,
    SwapRouter,
    Trade
} from '@uniswap/v3-sdk';
import { CurrencyAmount, Ether, Percent, TradeType } from '@uniswap/sdk-core';
import { Token } from '@uniswap/sdk-core';
import ERC20 from "@/abi/ERC20";

const poolsAddress = [
    "0x2f5e87c9312fa29aed5c179e456625d79015299c",   // WBTC/ETH
    "0xc6f780497a95e246eb9449f5e4770916dcd6396a",   // ARB/ETH
    "0xa961f0473da4864c5ed28e00fcc53a3aab056c1b",   // DAI/ETH
    "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443",   // USDC/ETH
    "0x641c00a822e8b671738d32a431a4fb6074e5c79d",   // USDT/ETH
    "0xc6962004f452be9203591991d15f6b388e09e8d0",   // USDC/ETH
    "0x59d72ddb29da32847a4665d08ffc8464a7185fae",   // MAGIC/ETH
    "0x80a9ae39310abf666a87c743d6ebbd0e8c42158e",   // GMX/ETH
    "0x446bf9748b4ea044dd759d9b9311c70491df8f29",   // RDNT/ETH
    "0xd3e11119d2680c963f1cdcffece0c4ade823fb58",   // SILO/ETH
    "0x4d834a9b910e6392460ebcfb59f8eef27d5c19ff",   // PREMIA/ETH
    "0xdbaeb7f0dfe3a0aafd798ccecb5b22e708f7852c",   // PENDLE/ETH
    "0x35218a1cbac5bbc3e57fd9bd38219d37571b3537",   // wstETH/ETH
    "0x681C2a4D924223563DbE35Da64E9a0f6A4967FAe",   // BTC.b/ETH
    "0x468b88941e7Cc0B88c1869d68ab6b570bCEF62Ff",  // LINK/ETH
    "0x809e6D99967164f4e212bf96953712F609E1E22b",  // JOE/ETH
    "0xa8BD646F72Ea828Ccbc40Fa2976866884f883409",  // STG/ETH
];

const externalTokens: Array<Address> = [
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "0x912CE59144191C1204E64559FE8253a0e49E6548",
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "0x2297aEbD383787A160DD0d9F71508148769342E3",
    "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07",
    "0x6694340fc020c5E6B96567843da2df01b2CE1eb6"
];

async function getAllPools() {
    const pools: Array<Pool> = [];

    const [contracts] = [
        poolsAddress.map((address) => [
            {
                address: address as Address,
                abi: UniswapV3,
                functionName: "token0",
            },
            {
                address: address as Address,
                abi: UniswapV3,
                functionName: "token1",
            },
            {
                address: address as Address,
                abi: UniswapV3,
                functionName: "fee",
            },
            {
                address: address as Address,
                abi: UniswapV3,
                functionName: "liquidity",
            },
            {
                address: address as Address,
                abi: UniswapV3,
                functionName: "slot0",
            }
        ])];

    const rawResult = await arbitrumPublicClient.multicall({
        contracts: contracts.flat(),
    });
    const decimals = await getDecimals({});

    for (let i = 0; i < rawResult.length; i = i + 5) {
        const token0 = rawResult[i].status === "success" ? rawResult[i + 0].result as Address : undefined;
        const token1 = rawResult[i + 1].status === "success" ? rawResult[i + 1].result as Address : undefined;
        const fee = rawResult[i + 2].status === "success" ? rawResult[i + 2].result as number : undefined;
        const liquidity = rawResult[i + 3].status === "success" ? rawResult[i + 3].result as bigint : undefined;
        const slot0 = rawResult[i + 4].status === "success" ? rawResult[i + 4].result as readonly [bigint, number, number, number, number, number, boolean] : undefined;

        const decimals0 = decimals.get(token0!.toLocaleLowerCase() as Address);
        const decimals1 = decimals.get(token1!.toLocaleLowerCase() as Address);

        if (!decimals0 || !decimals1) {
            // if we dont have decimals we skip the pool
            continue;
        }

        const token0Asset: Token = new Token(42161, token0!, decimals0!);
        const token1Asset: Token = new Token(42161, token1!, decimals1!);

        const _pool = {
            token0: token0Asset,
            token1: token1Asset,
            fee: fee,
            liquidity: liquidity!.toString(),
            sqrtPriceX96: slot0![0].toString(),
            tick: slot0![1],
        };

        const pool = new Pool(
            _pool.token0,
            _pool.token1,
            _pool.fee!,
            _pool.sqrtPriceX96,
            _pool.liquidity,
            _pool.tick
        );

        pools.push(pool);
    }

    return pools;
}

function createRoute(pools: Array<Pool>, inputToken: Token | Ether, outputToken: Token) {
    if (inputToken.equals(outputToken)) {
        throw new Error("Input token equals output token");
    }

    if (inputToken.isNative) {
        const pool = pools.find(pool => {
            return pool.token0.equals(outputToken) || pool.token1.equals(outputToken);
        });

        if (!pool) {
            throw new Error("Pool not found");
        }

        const route = new Route([pool], inputToken, outputToken);

        return route;
    }

    // easy case for weth as input 
    if (inputToken.address.toLocaleLowerCase() === ("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1".toLocaleLowerCase())) {
        const pool = pools.find(pool => {
            return pool.token0.equals(outputToken) || pool.token1.equals(outputToken);
        });

        if (!pool) {
            throw new Error("Pool not found");
        }

        const route = new Route([pool], inputToken, outputToken);

        return route;
    }
    // pools contains all the pools also those that are not used in the route
    // so we need to filter them
    const poolsUsed = pools.filter(pool => {
        return (
            pool.token0.equals(inputToken) ||
            pool.token1.equals(inputToken) ||
            pool.token0.equals(outputToken) ||
            pool.token1.equals(outputToken)
        );
    });

    // sort pools so first pool contains input token
    poolsUsed.sort((a, b) => {
        if (a.token0.equals(inputToken) || a.token1.equals(inputToken)) {
            return -1;
        }
        if (b.token0.equals(inputToken) || b.token1.equals(inputToken)) {
            return 1;
        }
        return 0;
    }); 

    const route = new Route(poolsUsed, inputToken, outputToken);

    return route;
}

async function getAmountOut(route: Route<Token | Ether, Token>, amountIn: BigNumber) {
    const { calldata, value } = SwapQuoter.quoteCallParameters(
        route,
        CurrencyAmount.fromRawAmount(
            route.input,
            amountIn.toFixed(0)
        ),
        TradeType.EXACT_INPUT,
        {
            useQuoterV2: true,
        }
    );

    const { data } = await arbitrumPublicClient.call({
        to: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        data: calldata as Address,
    })

    const [outValue] = decodeAbiParameters([{ name: 'amountOut', type: 'uint256' }], data!);

    return {
        amountOut: new BigNumber(outValue.toString()),
        ethValue: new BigNumber(value),
    }
}

function createTrade(route: Route<Token | Ether, Token>, amountIn: BigNumber, amountOut: BigNumber) {
    const uncheckedTrade = Trade.createUncheckedTrade({
        route: route,
        inputAmount: CurrencyAmount.fromRawAmount(
            route.input,
            amountIn.toFixed(0)
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
            route.output,
            amountOut.toFixed(0)
        ),
        tradeType: TradeType.EXACT_OUTPUT,
    })

    return uncheckedTrade
}

let cacheDecimals: Map<Address, number> | undefined = undefined;

async function getDecimals({ addresses }: { addresses?: Array<Address> }) {
    if (!addresses) {
        if (cacheDecimals) {
            return cacheDecimals;
        }
        throw new Error("Addresses is undefined");
    }
    const _decimals = await arbitrumPublicClient.multicall({
        contracts: addresses.map((address) => {
            return {
                address: address as Address,
                abi: ERC20,
                functionName: "decimals",
            }
        })
    });

    if (_decimals.length !== addresses.length) {
        throw new Error("Decimals length not equal addresses length");
    }

    const decimals: Map<Address, number> = new Map();
    for (const [index, address] of addresses.entries()) {
        const decimal = _decimals[index].result;
        if (decimal == undefined) {
            throw new Error("Decimals is not a number");
        }
        decimals.set(address.toString().toLocaleLowerCase() as Address, Number(decimal));
    }

    decimals.set("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLocaleLowerCase() as Address, 18);

    cacheDecimals = decimals;
    return cacheDecimals;
}

async function Create(targetShares: Map<Address, BigNumber>, shares: Map<Address, BigNumber>, inputAsset: Address, amountIn: BigNumber, multipoolAddress: Address) {
    if (amountIn == undefined) {
        throw new Error("AmountIn is undefined");
    }

    // filter out shares with 0
    shares.forEach((value, key) => {
        if (value.isEqualTo(0)) {
            shares.delete(key);
        }
    });

    for (const [address, amount] of shares.entries()) {
        if (amount.isLessThanOrEqualTo(0)) {
            throw new Error("Amount is less than or equal to 0");
        }
    }

    if (shares.values().next().value == new BigNumber(0)) {
        throw new Error("Shares is empty");
    }

    // move shares to targetShares
    for (const [address, amount] of targetShares.entries()) {
        if (shares.has(address)) {
            shares.set(address, amount);
        }
    }

    const decimals = await getDecimals({ addresses: [...shares.keys(), ...externalTokens] });
    const pools = await getAllPools();

    const inputDecimals = decimals.get(inputAsset.toLocaleLowerCase() as Address);
    if (!inputDecimals) {
        throw new Error("Decimals not found");
    }
    const inputToken = inputAsset.toLocaleLowerCase() != "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLocaleLowerCase() ? new Token(42161, inputAsset, inputDecimals) : new Token(42161, "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", inputDecimals);

    const callDatas: Array<{
        data: string;
        to: string;
        value: string;
        asset: Address;
        amountOut: BigNumber;
    }> = [];
    const outs: Map<Address, BigNumber> = new Map();

    for (const [address, amount] of shares.entries()) {
        const outDecimal = decimals.get(address.toLocaleLowerCase() as Address);
        if (!outDecimal) {
            throw new Error("Decimals not found");
        }
        const outputToken = new Token(42161, address as Address, outDecimal);

        const swapRoute = createRoute(pools, inputToken, outputToken);

        const amountInShare = amountIn.multipliedBy(amount).dividedBy(100);
        const { amountOut, ethValue } = await getAmountOut(swapRoute, amountInShare.multipliedBy(0.995));
        const trade = createTrade(swapRoute, amountInShare, amountOut);

        outs.set(address, amountOut);

        const options: SwapOptions = {
            slippageTolerance: new Percent(70, 10_000), // 50 bips, or 0.50%
            deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
            recipient: multipoolAddress,
        }

        const methodParameters = SwapRouter.swapCallParameters([trade], options);

        const tx = {
            data: methodParameters.calldata,
            to: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
            value: methodParameters.value,
            asset: address,
            amountOut: amountOut,
        };

        callDatas.push(tx);
    }

    return {
        calldata: callDatas,
        selectedAssets: outs,
    }
}

export { Create }
